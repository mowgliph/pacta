/**
 * Servicio para la gestión de usuarios
 * Implementa lógica de negocio específica para usuarios
 */
import { BaseService } from './BaseService.js';
import { UserRepository } from '../database/repositories/index.js';
import {
  ValidationError,
  ConflictError,
  NotFoundError,
  AuthenticationError,
} from '../utils/errors.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/app.config.js';
import { LoggingService } from './LoggingService.js';
import { CacheService } from './CacheService.js';
import { ValidationService } from './ValidationService.js';
import { ResponseService } from './ResponseService.js';

class UserService extends BaseService {
  constructor() {
    super(UserRepository);
    this.logger = new LoggingService('UserService');
    this.cache = new CacheService();
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
      // Validate user data
      const validatedData = await this.validation.validateUserRegistration(userData);

      // Check if user already exists
      const existingUser = await this.repository.findByEmail(validatedData.email);
      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      // Create user
      const user = await this.repository.create(validatedData);

      // Generate verification token
      await this.repository.updateEmailVerification(user.id, false);

      // Log registration
      this.logger.info('User registered', { userId: user.id, email: user.email });

      // Invalidate cache
      await this.cache.invalidateUserCache(user.id);

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
      // Find user
      const user = await this.repository.findByEmail(email);
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Check user status
      if (user.status !== 'active') {
        throw new AuthenticationError('Account is not active');
      }

      // Update last login
      await this.repository.updateLastLogin(user.id);

      // Log login
      this.logger.info('User logged in', { userId: user.id, email: user.email });

      // Invalidate cache
      await this.cache.invalidateUserCache(user.id);

      // Generate tokens
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
      const user = await this.repository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate profile data
      const validatedData = await this.validation.validateUserProfile(userData);

      // Update profile
      await this.repository.updateProfile(userId, validatedData);

      // Log profile update
      this.logger.info('User profile updated', { userId });

      // Invalidate cache
      await this.cache.invalidateUserCache(userId);

      return await this.repository.findById(userId);
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
    // Validar nueva contraseña
    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Obtener usuario
    const user = await this.getById(userId);

    // Verificar contraseña actual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Actualizar contraseña
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
      const user = await this.repository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate role
      if (!['admin', 'user', 'moderator'].includes(role)) {
        throw new ValidationError('Invalid role');
      }

      await this.repository.updateRole(userId, role);

      // Log role update
      this.logger.info('User role updated', { userId, role });

      // Invalidate cache
      await this.cache.invalidateUserCache(userId);

      return await this.repository.findById(userId);
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
      const user = await this.repository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate status
      if (!['active', 'inactive', 'suspended'].includes(status)) {
        throw new ValidationError('Invalid status');
      }

      await this.repository.updateStatus(userId, status);

      // Log status update
      this.logger.info('User status updated', { userId, status });

      // Invalidate cache
      await this.cache.invalidateUserCache(userId);

      return await this.repository.findById(userId);
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
    return this.repository.searchByName(query, page, limit);
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
    if (!data.email) errors.push('Email is required');
    if (!data.password) errors.push('Password is required');
    if (!data.firstName) errors.push('First name is required');
    if (!data.lastName) errors.push('Last name is required');

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
      const user = await this.repository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const refreshToken = this.repository.generateToken();
      await this.repository.updateRefreshToken(userId, refreshToken);

      // Log token refresh
      this.logger.info('User token refreshed', { userId });

      // Invalidate cache
      await this.cache.invalidateUserCache(userId);

      return refreshToken;
    } catch (error) {
      this.logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      const user = await this.repository.findByEmailVerificationToken(token);
      if (!user) {
        throw new ValidationError('Invalid verification token');
      }

      await this.repository.updateEmailVerification(user.id, true);

      // Log email verification
      this.logger.info('User email verified', { userId: user.id });

      // Invalidate cache
      await this.cache.invalidateUserCache(user.id);

      return user;
    } catch (error) {
      this.logger.error('Email verification failed', { error });
      throw error;
    }
  }

  async requestPasswordReset(email) {
    try {
      const user = await this.repository.findByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await this.repository.updatePasswordResetToken(user.id);

      // Log password reset request
      this.logger.info('Password reset requested', { userId: user.id });

      // Invalidate cache
      await this.cache.invalidateUserCache(user.id);

      return user;
    } catch (error) {
      this.logger.error('Password reset request failed', { error });
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const user = await this.repository.findByPasswordResetToken(token);
      if (!user) {
        throw new ValidationError('Invalid or expired reset token');
      }

      // Validate new password
      const validatedPassword = await this.validation.validatePassword(newPassword);

      // Update password
      await this.repository.update(user.id, { password: validatedPassword });
      await this.repository.clearPasswordResetToken(user.id);

      // Log password reset
      this.logger.info('User password reset', { userId: user.id });

      // Invalidate cache
      await this.cache.invalidateUserCache(user.id);

      return user;
    } catch (error) {
      this.logger.error('Password reset failed', { error });
      throw error;
    }
  }

  async getActiveUsers() {
    try {
      const cacheKey = 'active_users';
      const cachedUsers = await this.cache.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }

      const users = await this.repository.findActiveUsers();
      await this.cache.set(cacheKey, users, 300); // Cache for 5 minutes

      return users;
    } catch (error) {
      this.logger.error('Failed to get active users', { error });
      throw error;
    }
  }

  async getInactiveUsers() {
    try {
      const cacheKey = 'inactive_users';
      const cachedUsers = await this.cache.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }

      const users = await this.repository.findInactiveUsers();
      await this.cache.set(cacheKey, users, 300); // Cache for 5 minutes

      return users;
    } catch (error) {
      this.logger.error('Failed to get inactive users', { error });
      throw error;
    }
  }

  async getSuspendedUsers() {
    try {
      const cacheKey = 'suspended_users';
      const cachedUsers = await this.cache.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }

      const users = await this.repository.findSuspendedUsers();
      await this.cache.set(cacheKey, users, 300); // Cache for 5 minutes

      return users;
    } catch (error) {
      this.logger.error('Failed to get suspended users', { error });
      throw error;
    }
  }

  async getUnverifiedUsers() {
    try {
      const cacheKey = 'unverified_users';
      const cachedUsers = await this.cache.get(cacheKey);
      if (cachedUsers) {
        return cachedUsers;
      }

      const users = await this.repository.findUnverifiedUsers();
      await this.cache.set(cacheKey, users, 300); // Cache for 5 minutes

      return users;
    } catch (error) {
      this.logger.error('Failed to get unverified users', { error });
      throw error;
    }
  }
}

export default new UserService();
