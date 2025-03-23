import { BaseRoute } from './BaseRoute.js';
import { UserController } from '../api/controllers/UserController.js';
import { authenticate } from '../api/middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizationMiddleware.js';
import { ValidationService } from '../services/ValidationService.js';

export class UserRoute extends BaseRoute {
  constructor() {
    const controller = new UserController();
    super(controller);
    this.setupRoutes();
  }

  setupRoutes() {
    // Public routes
    this.custom('post', '/register', controller => controller.register, {
      validate: ValidationService.createRegisterSchema()
    });

    this.custom('post', '/login', controller => controller.login, {
      validate: ValidationService.createLoginSchema()
    });

    this.custom('post', '/password-reset', controller => controller.requestPasswordReset, {
      validate: ValidationService.createEmailSchema()
    });

    this.custom('post', '/password-reset/:token', controller => controller.resetPassword, {
      validate: ValidationService.createPasswordSchema()
    });

    this.custom('get', '/email-verification/:token', controller => controller.verifyEmail);

    // Protected routes
    this.router.use(authenticate);

    // Profile routes (authenticated users only)
    this.custom('get', '/profile', controller => controller.getById.bind(controller, { id: req => req.user.id }));

    this.custom('put', '/profile', controller => controller.updateProfile, {
      validate: ValidationService.createUserProfileSchema()
    });

    this.custom('post', '/refresh-token', controller => controller.refreshToken);

    // Admin routes
    this.router.use(authorize(['admin']));

    // Standard CRUD with validation and caching
    this.getAll({ 
      validate: true, 
      cache: 300 
    });
    
    this.getById({ 
      validate: true, 
      cache: 300 
    });
    
    this.create({ 
      validate: ValidationService.createUserRegistrationSchema() 
    });
    
    this.update({ 
      validate: ValidationService.createUserUpdateSchema() 
    });
    
    this.delete({ 
      validate: true 
    });

    // Bulk operations
    this.bulkCreate({ 
      validate: ValidationService.createBulkUserCreateSchema() 
    });
    
    this.bulkUpdate({ 
      validate: ValidationService.createBulkUserUpdateSchema() 
    });
    
    this.bulkDelete({ 
      validate: true 
    });

    // Search and count
    this.search({ 
      validate: true, 
      cache: 300 
    });
    
    this.count({ 
      validate: true, 
      cache: 300,
      fields: ['role', 'status', 'emailVerified'] 
    });

    // User management routes
    this.custom('put', '/:userId/status', controller => controller.updateStatus, {
      validate: ValidationService.createUserStatusSchema()
    });

    this.custom('put', '/:userId/role', controller => controller.updateRole, {
      validate: ValidationService.createUserRoleSchema()
    });

    // User filters
    this.custom('get', '/active', controller => controller.getActiveUsers, {
      cache: 300
    });

    this.custom('get', '/inactive', controller => controller.getInactiveUsers, {
      cache: 300
    });

    this.custom('get', '/suspended', controller => controller.getSuspendedUsers, {
      cache: 300
    });

    this.custom('get', '/unverified', controller => controller.getUnverifiedUsers, {
      cache: 300
    });
  }
} 