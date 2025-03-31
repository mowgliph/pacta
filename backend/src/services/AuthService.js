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
   * Autenticar un usuario por email y contraseña
   * @param {Object} credentials - Credenciales (email, password)
   * @returns {Promise<Object>} - Datos del usuario y tokens
   */
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      // Buscar usuario por email
      const user = await prisma.user.findUnique({ 
        where: { email } 
      });

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

      // Verificar que es un usuario del sistema
      if (!user.isSystemUser) {
        throw new UnauthorizedError('Acceso no autorizado para usuarios del sistema');
      }

      // Actualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generar tokens
      const tokens = this.generateTokens(user);

      // Registrar actividad
      await prisma.activity.create({
        data: {
          action: 'LOGIN',
          description: 'Inicio de sesión exitoso',
          userId: user.id,
          ipAddress: '',  // Se proporciona desde el controller
          userAgent: ''   // Se proporciona desde el controller
        }
      });

      return { 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isSystemUser: user.isSystemUser
        },
        ...tokens 
      };
    } catch (error) {
      this.logger.error('Login error', { email: credentials.email, error: error.message });
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
        where: { id: decoded.id }
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
          isSystemUser: user.isSystemUser
        }
      };
    } catch (error) {
      this.logger.error('Error verificando token', { error: error.message });
      throw error;
    }
  }

  /**
   * Genera tokens de acceso y refresco
   * @param {Object} user - Usuario autenticado
   * @returns {Object} - Tokens generados
   */
  generateTokens(user) {
    // Datos a incluir en el token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Generar token de acceso (corta duración)
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn || '15m',
    });

    // Generar token de refresco (larga duración)
    const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret || config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn || '7d',
    });

    // Guardar el token de refresco en la base de datos
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días por defecto

    prisma.refreshToken
      .create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      })
      .catch(error => {
        this.logger.error('Error saving refresh token', { userId: user.id, error: error.message });
      });

    return { accessToken, refreshToken };
  }
}

export default new AuthService(); 