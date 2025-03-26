/**
 * Servicio para la gestión de usuarios
 * Implementa lógica de negocio específica para usuarios
 */
import { BaseService } from './BaseService.js';
import repositories from '../database/repositories/index.js';
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  AuthenticationError,
} from '../utils/errors.js';
import jwt from 'jsonwebtoken';
import config from '../config/app.config.js';
import { LoggingService } from './LoggingService.js';
import { CacheService } from './CacheService.js';
import { ValidationService } from './ValidationService.js';

export class UserService extends BaseService {
  constructor() {
    super(repositories.user);
    this.userRepository = repositories.user;
    this.logger = new LoggingService('UserService');
    this.cacheService = new CacheService('users');
    this.validation = new ValidationService();
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise<Object>} - Usuario creado (sin contraseña)
   * @throws {ValidationError} - Si los datos son inválidos
   * @throws {ConflictError} - Si el email ya está registrado
   */
  async register(userData) {
    try {
      const validatedData = await this.validation.validateUserRegistration(userData);
      const existingUser = await this.userRepository.findByEmail(validatedData.email);
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }
      const user = await this.userRepository.create(validatedData);
      await this.userRepository.updateEmailVerification(user.id, false);
      this.logger.info('User registered', { userId: user.id, email: user.email });
      await this.cacheService.invalidateUserCache(user.id);
      return user;
    } catch (error) {
      this.logger.error('User registration failed', { error });
      throw error;
    }
  }

  /**
   * Autentica un usuario
   * @param {String} email - Email del usuario
   * @param {String} password - Contraseña del usuario
   * @returns {Promise<Object>} - Datos del usuario y tokens
   * @throws {AuthenticationError} - Si las credenciales son inválidas
   */
  async login(email, password) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }
      if (user.status !== 'active') {
        throw new AuthenticationError('Account is not active');
      }
      await this.userRepository.updateLastLogin(user.id);
      this.logger.info('User logged in', { userId: user.id, email: user.email });
      await this.cacheService.invalidateUserCache(user.id);
      const tokens = this._generateTokens(user);
      return {
        user: user.toJSON(),
        ...tokens,
      };
    } catch (error) {
      this.logger.error('User login failed', { error });
      throw error;
    }
  }

  /**
   * Actualiza el perfil de un usuario
   * @param {String} userId - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>} - Usuario actualizado
   * @throws {ValidationError} - Si los datos son inválidos
   */
  async updateProfile(userId, userData) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      const validatedData = await this.validation.validateUserProfile(userData);
      await this.userRepository.updateProfile(userId, validatedData);
      this.logger.info('User profile updated', { userId });
      await this.cacheService.invalidateUserCache(userId);
      return await this.userRepository.findById(userId);
    } catch (error) {
      this.logger.error('Profile update failed', { error });
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {String} userId - ID del usuario
   * @param {String} currentPassword - Contraseña actual
   * @param {String} newPassword - Nueva contraseña
   * @returns {Promise<Boolean>} - true si se cambió correctamente
   * @throws {ValidationError} - Si la contraseña no cumple los requisitos
   * @throws {AuthenticationError} - Si la contraseña actual es incorrecta
   */
  async changePassword(userId, currentPassword, newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    const user = await this.getById(userId);
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }
    await this.update(userId, { password: newPassword });
    return true;
  }

  /**
   * Actualiza el rol de un usuario (solo admins)
   * @param {String} userId - ID del usuario a modificar
   * @param {String} role - Nuevo rol
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateUserRole(userId, role) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      if (!['admin', 'user', 'moderator'].includes(role)) {
        throw new ValidationError('Invalid role');
      }
      await this.userRepository.updateRole(userId, role);
      this.logger.info('User role updated', { userId, role });
      await this.cacheService.invalidateUserCache(userId);
      return await this.userRepository.findById(userId);
    } catch (error) {
      this.logger.error('Role update failed', { error });
      throw error;
    }
  }

  /**
   * Actualiza el estado de un usuario (solo admins)
   * @param {String} userId - ID del usuario a modificar
   * @param {String} status - Nuevo estado
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateUserStatus(userId, status) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      if (!['active', 'inactive', 'suspended'].includes(status)) {
        throw new ValidationError('Invalid status');
      }
      await this.userRepository.updateStatus(userId, status);
      this.logger.info('User status updated', { userId, status });
      await this.cacheService.invalidateUserCache(userId);
      return await this.userRepository.findById(userId);
    } catch (error) {
      this.logger.error('Status update failed', { error });
      throw error;
    }
  }

  /**
   * Busca usuarios por nombre (parcial)
   * @param {String} query - Texto a buscar
   * @param {Number} page - Número de página
   * @param {Number} limit - Resultados por página
   * @returns {Promise<Object>} - Usuarios encontrados con paginación
   */
  async searchUsers(query, page = 1, limit = 10) {
    return this.userRepository.searchByName(query, page, limit);
  }

  /**
   * Genera tokens de acceso y refresco
   * @param {Object} user - Usuario
   * @returns {Object} - Tokens generados
   * @private
   */
  _generateTokens(user) {
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = jwt.sign(userData, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
    const refreshToken = jwt.sign(userData, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn,
    });
    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwtExpiresIn,
    };
  }

  /**
   * Validaciones específicas para creación de usuario
   * @param {Object} data - Datos a validar
   * @throws {ValidationError} - Si hay errores de validación
   * @protected
   */
  _validateCreate(data) {
    const errors = [];

    // Validar campos requeridos
    if (!data.email) {
      errors.push('Email is required');
    }
    if (!data.password) {
      errors.push('Password is required');
    }
    if (!data.firstName) {
      errors.push('First name is required');
    }
    if (!data.lastName) {
      errors.push('Last name is required');
    }

    // Validar formato de email
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    // Validar longitud de contraseña
    if (data.password && data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation error', errors);
    }
  }

  async refreshToken(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      const refreshToken = this.userRepository.generateToken();
      await this.userRepository.updateRefreshToken(userId, refreshToken);
      this.logger.info('User token refreshed', { userId });
      await this.cacheService.invalidateUserCache(userId);
      return refreshToken;
    } catch (error) {
      this.logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      const user = await this.userRepository.findByEmailVerificationToken(token);
      if (!user) {
        throw new ValidationError('Invalid verification token');
      }
      await this.userRepository.updateEmailVerification(user.id, true);
      this.logger.info('User email verified', { userId: user.id });
      await this.cacheService.invalidateUserCache(user.id);
      return user;
    } catch (error) {
      this.logger.error('Email verification failed', { error });
      throw error;
    }
  }

  async requestPasswordReset(email) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      await this.userRepository.updatePasswordResetToken(user.id);
      this.logger.info('Password reset requested', { userId: user.id });
      await this.cacheService.invalidateUserCache(user.id);
      return user;
    } catch (error) {
      this.logger.error('Password reset request failed', { error });
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const user = await this.userRepository.findByPasswordResetToken(token);
      if (!user) {
        throw new ValidationError('Invalid or expired reset token');
      }
      const validatedPassword = await this.validation.validatePassword(newPassword);
      await this.userRepository.update(user.id, { password: validatedPassword });
      await this.userRepository.clearPasswordResetToken(user.id);
      this.logger.info('User password reset', { userId: user.id });
      await this.cacheService.invalidateUserCache(user.id);
      return user;
    } catch (error) {
      this.logger.error('Password reset failed', { error });
      throw error;
    }
  }

  async getActiveUsers() {
    try {
      const cacheKey = 'active_users';
      const cachedUsers = await this.cacheService.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }
      const users = await this.userRepository.findActiveUsers();
      await this.cacheService.set(cacheKey, users, 300); // Cache por 5 minutos
      return users;
    } catch (error) {
      this.logger.error('Failed to get active users', { error });
      throw error;
    }
  }

  async getInactiveUsers() {
    try {
      const cacheKey = 'inactive_users';
      const cachedUsers = await this.cacheService.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }
      const users = await this.userRepository.findInactiveUsers();
      await this.cacheService.set(cacheKey, users, 300); // Cache por 5 minutos
      return users;
    } catch (error) {
      this.logger.error('Failed to get inactive users', { error });
      throw error;
    }
  }

  async getSuspendedUsers() {
    try {
      const cacheKey = 'suspended_users';
      const cachedUsers = await this.cacheService.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }
      const users = await this.userRepository.findSuspendedUsers();
      await this.cacheService.set(cacheKey, users, 300); // Cache por 5 minutos
      return users;
    } catch (error) {
      this.logger.error('Failed to get suspended users', { error });
      throw error;
    }
  }

  async getUnverifiedUsers() {
    try {
      const cacheKey = 'unverified_users';
      const cachedUsers = await this.cacheService.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }
      const users = await this.userRepository.findUnverifiedUsers();
      await this.cacheService.set(cacheKey, users, 300); // Cache por 5 minutos
      return users;
    } catch (error) {
      this.logger.error('Failed to get unverified users', { error });
      throw error;
    }
  }
}

export default new UserService();
