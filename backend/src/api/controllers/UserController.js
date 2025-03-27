import { BaseController } from './BaseController.js';
import { UserService } from '../../services/UserService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserController extends BaseController {
  constructor() {
    const userService = new UserService();
    super(userService);
    this.userService = userService;
    this.validationService = new ValidationService();
  }

  getAllUsers = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const filters = {
          ...req.query,
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10
        };
        return await this.userService.getAllUsers(filters);
      },
      { filters: req.query }
    );
  };

  getTeamData = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        if (!['MANAGER', 'ADMIN'].includes(req.user.role)) {
          throw new ForbiddenError('No tienes permisos para ver estos datos');
        }
        return await this.userService.getTeamData();
      },
      { role: req.user.role }
    );
  };

  getUserById = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const user = await this.userService.getUserById(id);
        if (!user) {
          throw new NotFoundError('Usuario no encontrado');
        }
        return user;
      },
      { userId: req.params.id }
    );
  };

  getProfile = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const userId = req.user.id;
        return await this.userService.getProfile(userId);
      },
      { userId: req.user.id }
    );
  };

  createUser = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const validatedData = await this.validationService.validateUserData(req.body);
        return await this.userService.createUser(validatedData);
      },
      { userData: req.body }
    );
  };

  updateUser = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const validatedData = await this.validationService.validateUserUpdate(req.body);
        return await this.userService.updateUser(id, validatedData);
      },
      { userId: req.params.id, updates: req.body }
    );
  };

  updateProfile = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const userId = req.user.id;
        const validatedData = await this.validationService.validateProfileUpdate(req.body);
        return await this.userService.updateProfile(userId, validatedData);
      },
      { userId: req.user.id, updates: req.body }
    );
  };

  updateUserRole = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const { role } = req.body;
        
        if (parseInt(id) === req.user.id) {
          throw new ForbiddenError('No puedes cambiar tu propio rol');
        }

        return await this.userService.updateUserRole(id, role, req.user.id);
      },
      { userId: req.params.id, role: req.body.role, adminId: req.user.id }
    );
  };

  updateUserStatus = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const { status } = req.body;

        if (parseInt(id) === req.user.id) {
          throw new ForbiddenError('No puedes cambiar tu propio estado');
        }

        return await this.userService.updateUserStatus(id, status, req.user.id);
      },
      { userId: req.params.id, status: req.body.status, adminId: req.user.id }
    );
  };

  changePassword = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const userId = req.user.id;
        const validatedData = await this.validationService.validatePasswordChange(req.body);
        await this.userService.changePassword(userId, validatedData);
        return { message: 'Contraseña actualizada exitosamente' };
      },
      { userId: req.user.id }
    );
  };

  deleteUser = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        await this.userService.deleteUser(id);
        return { message: 'Usuario eliminado exitosamente' };
      },
      { userId: req.params.id }
    );
  };

  searchUsers = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { q, page = 1, limit = 10 } = req.query;
        if (!q) {
          throw new ValidationError('Se requiere un término de búsqueda');
        }
        return await this.userService.searchUsers(q, parseInt(page), parseInt(limit));
      },
      { query: req.query }
    );
  };
}

export default UserController;
