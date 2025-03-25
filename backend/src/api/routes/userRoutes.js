/**
 * Rutas para gestión de usuarios
 */
import { BaseRoute } from './BaseRoute.js';
import UserController from '../controllers/UserController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ValidationService } from '../../services/ValidationService.js';
import { z } from 'zod';

class UserRoutes extends BaseRoute {
  constructor() {
    super(UserController);
    this.initializeRoutes();
    this.validationService = new ValidationService();
  }

  initializeRoutes() {
    // Rutas públicas de autenticación (ahora se manejan en auth.js)
    // Las dejamos aquí por compatibilidad
    this.post('/auth/register', validate(this.validationService.validators.user.userCreateSchema), this.controller.register);
    this.post('/auth/login', validate(this.validationService.validators.auth.loginSchema), this.controller.login);

    // Rutas protegidas de perfil (requieren autenticación)
    this.get('/profile', authenticateToken, this.controller.getProfile);
    this.put(
      '/profile', 
      [
        authenticateToken,
        validate(this.validationService.validators.user.userProfileSchema)
      ], 
      this.controller.updateProfile
    );
    this.post(
      '/profile/change-password', 
      [
        authenticateToken,
        validate(this.validationService.validators.user.changePasswordSchema)
      ], 
      this.controller.changePassword
    );

    // Rutas de administración (requieren rol admin)
    this.get(
      '/users',
      [
        authenticateToken,
        isAdmin,
        validate(this.validationService.validators.user.userQuerySchema, 'query')
      ],
      this.controller.getAllUsers
    );
    
    this.get(
      '/users/:id',
      [
        authenticateToken,
        isAdmin,
        validate(this.validationService.validators.user.userIdSchema, 'params')
      ],
      this.controller.getUserById
    );
    
    this.post(
      '/users',
      [
        authenticateToken,
        isAdmin,
        validate(this.validationService.validators.user.userCreateSchema)
      ],
      this.controller.createUser
    );
    
    this.put(
      '/users/:id',
      [
        authenticateToken,
        isAdmin,
        validate(this.validationService.validators.user.userIdSchema, 'params'),
        validate(this.validationService.validators.user.userUpdateSchema)
      ],
      this.controller.updateUser
    );
    
    this.delete(
      '/users/:id',
      [
        authenticateToken,
        isAdmin,
        validate(this.validationService.validators.user.userIdSchema, 'params')
      ],
      this.controller.deleteUser
    );
    
    this.put(
      '/users/:id/role',
      [
        authenticateToken,
        isAdmin,
        validate(this.validationService.validators.user.userIdSchema, 'params'),
        validate(z.object({
          role: z.enum(['USER', 'ADMIN', 'MANAGER'])
        }))
      ],
      this.controller.updateUserRole
    );
    
    this.put(
      '/users/:id/status',
      [
        authenticateToken,
        isAdmin,
        validate(this.validationService.validators.user.userIdSchema, 'params'),
        validate(z.object({
          status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'])
        }))
      ],
      this.controller.updateUserStatus
    );

    // Búsqueda de usuarios
    this.get(
      '/users/search',
      [
        authenticateToken,
        isAdmin,
        validate(this.validationService.validators.user.userQuerySchema, 'query')
      ],
      this.controller.searchUsers
    );

    // Preferencias de usuario
    this.get(
      '/profile/preferences',
      authenticateToken,
      this.controller.getUserPreferences
    );
    
    this.put(
      '/profile/preferences',
      [
        authenticateToken,
        validate(this.validationService.validators.user.userPreferencesSchema)
      ],
      this.controller.updateUserPreferences
    );
  }
}

export default new UserRoutes().getRouter();
