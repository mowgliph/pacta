import { BaseService } from './BaseService.js';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import prisma from '../database/prisma.js';
import jwt from 'jsonwebtoken';
import { compareSync } from 'bcrypt';
import { LoggingService } from './LoggingService.js';
import config from '../config/app.config.js';

export class AuthService extends BaseService {
  constructor() {
    super();
    this.logger = new LoggingService('AuthService');
  }

  /**
   * Autenticar un usuario por username o email y contraseña
   * @param {Object} credentials - Credenciales (username, password)
   * @returns {Promise<Object>} - Datos del usuario y tokens
   */
  async login(credentials) {
    try {
      const { username, password, rememberMe } = credentials;

      // Buscar usuario por username (podría ser el email o un nombre de usuario)
      let user = null;

      // Primero intentar buscar por email exacto
      user = await prisma.user.findUnique({
        where: { email: username },
      });

      // Si no se encuentra, verificar si es RA o admin (los nombres de usuario reservados)
      if (!user) {
        // Para RA
        if (username.toLowerCase() === 'ra') {
          user = await prisma.user.findFirst({
            where: {
              role: 'RA',
              isSystemUser: true,
            },
          });
        }
        // Para admin
        else if (username.toLowerCase() === 'admin') {
          user = await prisma.user.findFirst({
            where: {
              role: 'ADMIN',
              isSystemUser: true,
            },
          });
        }
      }

      if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
      }

      // Verificar contraseña
      if (!compareSync(password, user.password)) {
        throw new UnauthorizedError('Contraseña incorrecta');
      }

      // Verificar que el usuario está activo
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedError('Usuario inactivo');
      }

      // Verificar que es un usuario del sistema (RA o admin)
      if (!user.isSystemUser) {
        throw new UnauthorizedError('Acceso no autorizado para usuarios del sistema');
      }

      // Actualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generar tokens considerando la opción de recordarme
      // Si es recordarme, generar un token de larga duración
      const tokens = this.generateTokens(user, rememberMe);

      // Registrar actividad
      await prisma.activity.create({
        data: {
          action: 'LOGIN',
          description: 'Inicio de sesión exitoso',
          userId: user.id,
          ipAddress: '', // Se proporciona desde el controller
          userAgent: '', // Se proporciona desde el controller
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isSystemUser: user.isSystemUser,
        },
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Login error', { username: credentials.username, error: error.message });
      throw error;
    }
  }

  /**
   * Refrescar el token de acceso usando un token de refresco
   * @param {String} refreshToken - Token de refresco
   * @returns {Promise<Object>} - Nuevos tokens
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new UnauthorizedError('Token de actualización requerido');
      }

      // Verificar que el token existe en la base de datos
      const tokenData = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenData) {
        throw new UnauthorizedError('Token inválido');
      }

      // Verificar que el token no ha expirado
      if (new Date() > new Date(tokenData.expiresAt)) {
        // Eliminar token expirado
        await prisma.refreshToken.delete({
          where: { id: tokenData.id },
        });

        throw new UnauthorizedError('Token expirado');
      }

      // Verificar la firma del token
      try {
        jwt.verify(refreshToken, config.jwt.refreshSecret || config.jwt.secret);
      } catch (error) {
        // Eliminar token inválido
        await prisma.refreshToken.delete({
          where: { id: tokenData.id },
        });

        throw new UnauthorizedError('Token inválido');
      }

      // Generar nuevos tokens
      const tokens = this.generateTokens(tokenData.user);

      // Eliminar el token de refresco antiguo
      await prisma.refreshToken.delete({
        where: { id: tokenData.id },
      });

      return tokens;
    } catch (error) {
      this.logger.error('Error al refrescar token', { error: error.message });
      throw error;
    }
  }

  /**
   * Verificar un token de autenticación
   * @param {String} token - Token a verificar
   * @returns {Promise<Object>} - Datos del usuario
   */
  async verifyToken(token) {
    try {
      if (!token) {
        throw new UnauthorizedError('Token no proporcionado');
      }

      const decoded = jwt.verify(token, config.jwt.secret);

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedError('Usuario inactivo');
      }

      if (!user.isSystemUser) {
        throw new UnauthorizedError('Acceso no autorizado para usuarios del sistema');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isSystemUser: user.isSystemUser,
        },
      };
    } catch (error) {
      this.logger.error('Error verificando token', { error: error.message });
      throw error;
    }
  }

  /**
   * Generar tokens de autenticación para un usuario
   * @param {Object} user - Usuario para el que generar tokens
   * @param {Boolean} rememberMe - Indica si se debe generar un token de larga duración
   * @returns {Object} - Tokens generados
   */
  generateTokens(user, rememberMe = false) {
    // Datos a incluir en el token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Duración del token (por defecto 1 día)
    const expiresIn = rememberMe
      ? config.jwt.longExpiresIn || '30d' // 30 días si es recordarme
      : config.jwt.expiresIn || '1d'; // 1 día si es normal

    // Generar access token
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn });

    // Generar refresh token
    // En este caso estamos generando el mismo token, pero en una implementación
    // completa, el refresh token debería ser diferente y tener una expiración más larga
    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn || '7d',
    });

    return {
      token,
      refreshToken,
      expiresIn,
    };
  }
}

export default new AuthService();
