/**
 * Rutas para gestión de usuarios
 */
import { BaseRoute } from './BaseRoute.js';
import UserController from '../controllers/UserController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizationMiddleware.js';

class UserRoutes extends BaseRoute {
  constructor() {
    super(UserController);
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Rutas públicas de autenticación
    this.post('/auth/register', this.controller.register);
    this.post('/auth/login', this.controller.login);
    
    // Rutas protegidas de perfil (requieren autenticación)
    this.get('/profile', this.controller.getProfile, [authenticate]);
    this.put('/profile', this.controller.updateProfile, [authenticate]);
    this.post('/profile/change-password', this.controller.changePassword, [authenticate]);
    
    // Rutas de administración (requieren rol admin)
    this.get('/users', this.controller.getAll, [authenticate, authorize('admin')]);
    this.get('/users/:id', this.controller.getById, [authenticate, authorize('admin')]);
    this.put('/users/:id/role', this.controller.updateUserRole, [authenticate, authorize('admin')]);
    this.put('/users/:id/status', this.controller.updateUserStatus, [authenticate, authorize('admin')]);
    
    // Búsqueda de usuarios
    this.get('/users/search', this.controller.searchUsers, [authenticate, authorize('admin')]);
  }
}

export default new UserRoutes().getRouter(); 