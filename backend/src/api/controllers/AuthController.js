import crypto from 'crypto';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { BaseController } from './BaseController.js';
import { generateTokens, refreshToken as refresh } from '../middleware/authMiddleware.js';
import { compareSync, hashSync } from 'bcrypt';
import { ValidationError, UnauthorizedError, NotFoundError } from '../../utils/errors.js';
import { ValidationService } from '../../services/ValidationService.js';

/**
 * Controlador para gestionar la autenticación de usuarios
 */
class AuthController extends BaseController {
  constructor() {
    super();
    this.validationService = new ValidationService();
  }

  /**
   * Inicia sesión de un usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async login(req, res) {
    try {
      // Validar datos con Zod
      const validatedData = this.validationService.validateLogin(req.body);
      const { email, password } = validatedData;
      
      // Buscar usuario por email
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      // Verificar si el usuario existe
      if (!user) {
        throw new UnauthorizedError('Credenciales inválidas');
      }
      
      // Verificar si la cuenta está activa
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedError('Cuenta inactiva o suspendida');
      }
      
      // Verificar contraseña
      if (!compareSync(password, user.password)) {
        // Registrar intento fallido
        logger.warn('Intento de login fallido', { email });
        throw new UnauthorizedError('Credenciales inválidas');
      }
      
      // Generar tokens
      const tokens = generateTokens(user);
      
      // Actualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
      
      // Registrar login exitoso
      logger.info('Login exitoso', { userId: user.id });
      
      // Responder con tokens
      return this.sendSuccess(res, {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        ...tokens,
      });
    } catch (error) {
      return this.handleError(error, res, 'login');
    }
  }
  
  /**
   * Registra un nuevo usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async register(req, res) {
    try {
      // Validar datos con Zod
      const validatedData = this.validationService.validateRegistration(req.body);
      const { firstName, lastName, email, password } = validatedData;
      
      // Verificar si el email ya está registrado
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        throw new ValidationError('El email ya está registrado');
      }
      
      // Crear usuario
      const hashedPassword = hashSync(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: 'USER',
          status: 'PENDING',
          verificationToken,
        },
      });
      
      // Registrar actividad
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          entityType: 'User',
          entityId: user.id.toString(),
          details: 'Registro de usuario',
        },
      });
      
      // Enviar email de verificación (aquí iría el código)
      
      // Responder exitosamente
      return this.sendSuccess(
        res,
        {
          message: 'Usuario registrado correctamente. Por favor verifica tu email.',
          userId: user.id,
        },
        201
      );
    } catch (error) {
      return this.handleError(error, res, 'register');
    }
  }
  
  /**
   * Refresca el token de acceso
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async refreshToken(req, res) {
    try {
      // Validar datos con Zod
      const validatedData = this.validationService.validateRefreshToken(req.body);
      const { refreshToken: token } = validatedData;
      
      // Refrescar token
      const tokens = await refresh(token);
      
      return this.sendSuccess(res, tokens);
    } catch (error) {
      return this.handleError(error, res, 'refreshToken');
    }
  }
  
  /**
   * Solicita restablecimiento de contraseña
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async forgotPassword(req, res) {
    try {
      // Validar datos con Zod
      const validatedData = this.validationService.validatePasswordResetRequest(req.body);
      const { email } = validatedData;
      
      // Verificar si el usuario existe
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        // No revelar si el usuario existe o no
        return this.sendSuccess(res, {
          message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña',
        });
      }
      
      // Generar token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hora
      
      // Guardar token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });
      
      // Enviar email (aquí iría el código)
      
      return this.sendSuccess(res, {
        message: 'Si el email está registrado, recibirás instrucciones para restablecer tu contraseña',
      });
    } catch (error) {
      return this.handleError(error, res, 'forgotPassword');
    }
  }
  
  /**
   * Restablece la contraseña
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async resetPassword(req, res) {
    try {
      // Validar datos con Zod
      const validatedData = this.validationService.validatePasswordReset(req.body);
      const { token, newPassword: password } = validatedData;
      
      // Buscar usuario con token válido
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });
      
      if (!user) {
        throw new UnauthorizedError('Token inválido o expirado');
      }
      
      // Actualizar contraseña
      const hashedPassword = hashSync(password, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
      
      // Registrar actividad
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'RESET_PASSWORD',
          entityType: 'User',
          entityId: user.id.toString(),
          details: 'Restablecimiento de contraseña',
        },
      });
      
      return this.sendSuccess(res, {
        message: 'Contraseña restablecida correctamente',
      });
    } catch (error) {
      return this.handleError(error, res, 'resetPassword');
    }
  }
  
  /**
   * Verifica el email de un usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async verifyEmail(req, res) {
    try {
      // Validar datos con Zod
      const validatedData = this.validationService.validateEmailVerification(req.params);
      const { token } = validatedData;
      
      // Buscar usuario con token
      const user = await prisma.user.findFirst({
        where: { verificationToken: token },
      });
      
      if (!user) {
        throw new NotFoundError('Token inválido');
      }
      
      // Activar cuenta
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
          verificationToken: null,
          emailVerified: true,
        },
      });
      
      // Registrar actividad
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'VERIFY_EMAIL',
          entityType: 'User',
          entityId: user.id.toString(),
          details: 'Verificación de email',
        },
      });
      
      return this.sendSuccess(res, {
        message: 'Email verificado correctamente',
      });
    } catch (error) {
      return this.handleError(error, res, 'verifyEmail');
    }
  }

  /**
   * Cambia la contraseña del usuario actual
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async changePassword(req, res) {
    try {
      // Validar datos con Zod
      const validatedData = this.validationService.validateChangePassword(req.body);
      const { currentPassword, newPassword } = validatedData;
      
      // Obtener usuario actual
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }
      
      // Verificar contraseña actual
      if (!compareSync(currentPassword, user.password)) {
        throw new UnauthorizedError('Contraseña actual incorrecta');
      }
      
      // Actualizar contraseña
      const hashedPassword = hashSync(newPassword, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });
      
      // Registrar actividad
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'CHANGE_PASSWORD',
          entityType: 'User',
          entityId: user.id.toString(),
          details: 'Cambio de contraseña',
        },
      });
      
      return this.sendSuccess(res, {
        message: 'Contraseña actualizada correctamente',
      });
    } catch (error) {
      return this.handleError(error, res, 'changePassword');
    }
  }
}

export default AuthController;
