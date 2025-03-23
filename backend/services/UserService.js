import { BaseService } from './BaseService.js';
import { UserRepository } from '../database/repositories/UserRepository.js';
import { ValidationError, NotFoundError, AuthenticationError } from '../utils/errors.js';
import { LoggingService } from './LoggingService.js';
import { CacheService } from './CacheService.js';
import { ValidationService } from './ValidationService.js';
import { ResponseService } from './ResponseService.js';

export class UserService extends BaseService {
  constructor() {
    super(new UserRepository());
    this.logger = new LoggingService('UserService');
    this.cache = new CacheService();
    this.validation = new ValidationService();
  }

  async register(userData) {
    try {
      // Validate user data
      const validatedData = await this.validation.validateUserRegistration(userData);

      // Check if user already exists
      const existingUser = await this.repository.findByEmail(validatedData.email);
      if (existingUser) {
        throw new ValidationError('Email already registered');
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

      return user;
    } catch (error) {
      this.logger.error('User login failed', { error });
      throw error;
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

  async updateProfile(userId, profileData) {
    try {
      const user = await this.repository.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate profile data
      const validatedData = await this.validation.validateUserProfile(profileData);

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

  async updateStatus(userId, status) {
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

  async updateRole(userId, role) {
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