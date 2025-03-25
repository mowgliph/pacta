import { User, License, ActivityLog } from '../models/index.js';
import { BaseController } from './BaseController.js';
import UserService from '../../services/UserService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { ResponseService } from '../../services/ResponseService.js';
import { LoggingService } from '../../services/LoggingService.js';
import { CacheService } from '../../services/CacheService.js';
import { AuthenticationError, ValidationError, NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';
import { compareSync, hashSync } from 'bcrypt';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';

const prismaClient = new PrismaClient();

/**
 * Controlador para gestionar usuarios
 */
class UserController extends BaseController {
  constructor() {
    super(UserService);
    this.validation = new ValidationService();
    this.response = new ResponseService();
    this.logger = new LoggingService('UserController');
    this.cache = new CacheService();
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  register = async (req, res, next) => {
    try {
      const userData = req.body;
      const user = await this.service.register(userData);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Autentica a un usuario
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await this.service.login(email, password);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza el perfil del usuario actual
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  updateProfile = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;
      
      // Validar datos
      if (!firstName && !lastName && !email) {
        throw new ValidationError('No se proporcionaron datos para actualizar');
      }
      
      // Verificar si el email ya existe (si se está cambiando)
      if (email && email !== req.user.email) {
        const existingUser = await prismaClient.user.findUnique({
          where: { email },
        });
        
        if (existingUser) {
          throw new ValidationError('El email ya está en uso');
        }
      }
      
      // Actualizar usuario
      const updatedUser = await prismaClient.user.update({
        where: { id: userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      // Registrar actividad
      await prismaClient.activityLog.create({
        data: {
          userId,
          action: 'UPDATE_PROFILE',
          entityType: 'User',
          entityId: userId.toString(),
          details: 'Actualización de perfil',
        },
      });
      
      return this.sendSuccess(res, updatedUser, 200, 'Perfil actualizado correctamente');
    } catch (error) {
      return this.handleError(error, res, 'updateProfile');
    }
  };

  /**
   * Cambia la contraseña del usuario actual
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  changePassword = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Validar datos
      if (!currentPassword || !newPassword) {
        throw new ValidationError('Contraseña actual y nueva son requeridas');
      }
      
      // Buscar usuario
      const user = await prismaClient.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }
      
      // Verificar contraseña actual
      if (!compareSync(currentPassword, user.password)) {
        throw new ValidationError('Contraseña actual incorrecta');
      }
      
      // Actualizar contraseña
      const hashedPassword = hashSync(newPassword, 10);
      
      await prismaClient.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      
      // Registrar actividad
      await prismaClient.activityLog.create({
        data: {
          userId,
          action: 'CHANGE_PASSWORD',
          entityType: 'User',
          entityId: userId.toString(),
          details: 'Cambio de contraseña',
        },
      });
      
      return this.sendSuccess(res, null, 200, 'Contraseña actualizada correctamente');
    } catch (error) {
      return this.handleError(error, res, 'changePassword');
    }
  };

  /**
   * Obtiene el perfil del usuario actual
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  getProfile = async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const user = await prismaClient.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }
      
      return this.sendSuccess(res, user);
    } catch (error) {
      return this.handleError(error, res, 'getProfile');
    }
  };

  /**
   * [ADMIN] Actualiza el rol de un usuario
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  updateUserRole = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validar rol
      if (!role || !['USER', 'MANAGER', 'ADMIN'].includes(role)) {
        throw new ValidationError('Rol inválido');
      }
      
      // No permitir cambiar el rol propio
      if (parseInt(id) === req.user.id) {
        throw new ValidationError('No puedes cambiar tu propio rol');
      }
      
      // Verificar que el usuario existe
      const user = await prismaClient.user.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }
      
      // Actualizar rol
      const updatedUser = await prismaClient.user.update({
        where: { id: parseInt(id) },
        data: { role },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
        },
      });
      
      // Registrar actividad
      await prismaClient.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_USER_ROLE',
          entityType: 'User',
          entityId: id,
          details: `Rol de usuario actualizado a ${role}: ${user.email}`,
        },
      });
      
      return this.sendSuccess(res, updatedUser, 200, 'Rol de usuario actualizado');
    } catch (error) {
      return this.handleError(error, res, 'updateUserRole');
    }
  };

  /**
   * [ADMIN] Actualiza el estado de un usuario
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  updateUserStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validar estado
      if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
        throw new ValidationError('Estado inválido');
      }
      
      // No permitir cambiar el estado propio
      if (parseInt(id) === req.user.id) {
        throw new ValidationError('No puedes cambiar tu propio estado');
      }
      
      // Verificar que el usuario existe
      const user = await prismaClient.user.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }
      
      // Actualizar estado
      const updatedUser = await prismaClient.user.update({
        where: { id: parseInt(id) },
        data: { status },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
        },
      });
      
      // Registrar actividad
      await prismaClient.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_USER_STATUS',
          entityType: 'User',
          entityId: id,
          details: `Estado de usuario actualizado a ${status}: ${user.email}`,
        },
      });
      
      return this.sendSuccess(res, updatedUser, 200, 'Estado de usuario actualizado');
    } catch (error) {
      return this.handleError(error, res, 'updateUserStatus');
    }
  };

  /**
   * Busca usuarios por nombre
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  searchUsers = async (req, res, next) => {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        throw new ValidationError('Search query is required');
      }

      const result = await this.service.searchUsers(q, parseInt(page, 10), parseInt(limit, 10));

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Email verification routes
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;
      const user = await this.service.verifyEmail(token);
      const response = this.response.success('Email verified successfully', user);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Password reset routes
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;
      await this.service.requestPasswordReset(email);
      const response = this.response.success('Password reset instructions sent to email');
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;
      const user = await this.service.resetPassword(token, newPassword);
      const response = this.response.success('Password reset successfully', user);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // User management routes (admin only)
  async getActiveUsers(req, res, next) {
    try {
      const users = await this.service.getActiveUsers();
      const response = this.response.success('Active users retrieved successfully', users);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getInactiveUsers(req, res, next) {
    try {
      const users = await this.service.getInactiveUsers();
      const response = this.response.success('Inactive users retrieved successfully', users);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getSuspendedUsers(req, res, next) {
    try {
      const users = await this.service.getSuspendedUsers();
      const response = this.response.success('Suspended users retrieved successfully', users);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUnverifiedUsers(req, res, next) {
    try {
      const users = await this.service.getUnverifiedUsers();
      const response = this.response.success('Unverified users retrieved successfully', users);
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Middleware methods
  validateRegistration = this.validateRequest(this.validation.createUserRegistrationSchema());
  validateLogin = this.validateRequest(this.validation.createUserLoginSchema());
  validateProfileUpdate = this.validateRequest(this.validation.createUserProfileSchema());
  validateStatusUpdate = this.validateRequest(this.validation.createUserStatusSchema());
  validateRoleUpdate = this.validateRequest(this.validation.createUserRoleSchema());
  validatePasswordReset = this.validateRequest(this.validation.createPasswordResetSchema());

  // Cache middleware
  cacheUserProfile = this.cacheResponse(300); // Cache for 5 minutes
  cacheUserList = this.cacheResponse(300); // Cache for 5 minutes

  // Logging middleware
  logUserOperation = this.logOperation('User operation');

  /**
   * Obtiene datos del equipo (solo para roles MANAGER y ADMIN)
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async getTeamData(req, res) {
    try {
      // Esta función solo debe ser accesible para MANAGER y ADMIN
      if (!['MANAGER', 'ADMIN'].includes(req.user.role)) {
        throw new ForbiddenError('No tienes permisos para ver estos datos');
      }
      
      // Obtener usuarios del equipo
      const users = await prismaClient.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: { lastName: 'asc' },
      });
      
      // Obtener estadísticas de contratos por usuario
      const contractStats = await prismaClient.contract.groupBy({
        by: ['userId'],
        _count: {
          id: true,
        },
      });
      
      // Combinar datos
      const teamData = users.map(user => {
        const userStats = contractStats.find(stat => stat.userId === user.id);
        return {
          ...user,
          contractCount: userStats ? userStats._count.id : 0,
        };
      });
      
      return this.sendSuccess(res, teamData);
    } catch (error) {
      return this.handleError(error, res, 'getTeamData');
    }
  }
  
  /**
   * Obtiene todos los usuarios
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const skip = (page - 1) * limit;
      
      // Construir filtro de búsqueda
      const where = {};
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      // Contar total
      const total = await prismaClient.user.count({ where });
      
      // Obtener usuarios
      const users = await prismaClient.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { lastName: 'asc' },
        skip,
        take: parseInt(limit),
      });
      
      return this.sendPaginated(res, {
        data: users,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return this.handleError(error, res, 'getAllUsers');
    }
  }
  
  /**
   * Obtiene un usuario por ID
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async getUserById(req, res) {
  try {
    const { id } = req.params;

      const user = await prismaClient.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }
      
      // Obtener estadísticas adicionales
      const contractCount = await prismaClient.contract.count({
        where: { userId: parseInt(id) },
      });
      
      const licenseCount = await prismaClient.license.count({
        where: { userId: parseInt(id) },
      });
      
      return this.sendSuccess(res, {
        ...user,
        statistics: {
          contractCount,
          licenseCount,
        },
      });
    } catch (error) {
      return this.handleError(error, res, 'getUserById');
    }
  }
  
  /**
   * Crea un nuevo usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async createUser(req, res) {
    try {
      const { firstName, lastName, email, password, role } = req.body;
      
      // Validar datos
      if (!firstName || !lastName || !email || !password) {
        throw new ValidationError('Todos los campos son requeridos');
      }
      
      // Verificar email único
      const existingUser = await prismaClient.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        throw new ValidationError('El email ya está registrado');
      }
      
      // Crear usuario
      const hashedPassword = hashSync(password, 10);
      
      const user = await prismaClient.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: role || 'USER',
          status: 'ACTIVE',
          emailVerified: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      // Registrar actividad
      await prismaClient.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'CREATE_USER',
          entityType: 'User',
          entityId: user.id.toString(),
          details: `Usuario creado por administrador: ${user.email}`,
        },
      });
      
      return this.sendSuccess(res, user, 201, 'Usuario creado correctamente');
    } catch (error) {
      return this.handleError(error, res, 'createUser');
    }
  }
  
  /**
   * Actualiza un usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role, status } = req.body;
      
      // Validar datos
      if (!firstName && !lastName && !email && !role && !status) {
        throw new ValidationError('No se proporcionaron datos para actualizar');
      }
      
      // Verificar que el usuario existe
      const existingUser = await prismaClient.user.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!existingUser) {
        throw new NotFoundError('Usuario no encontrado');
      }
      
      // Verificar email único si se está cambiando
      if (email && email !== existingUser.email) {
        const duplicateEmail = await prismaClient.user.findUnique({
          where: { email },
        });
        
        if (duplicateEmail) {
          throw new ValidationError('El email ya está en uso');
        }
      }
      
      // Actualizar usuario
      const updatedUser = await prismaClient.user.update({
        where: { id: parseInt(id) },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...(role && { role }),
          ...(status && { status }),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    // Registrar actividad
      await prismaClient.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_USER',
          entityType: 'User',
          entityId: id,
          details: `Usuario actualizado por administrador: ${updatedUser.email}`,
        },
      });
      
      return this.sendSuccess(res, updatedUser, 200, 'Usuario actualizado correctamente');
  } catch (error) {
      return this.handleError(error, res, 'updateUser');
    }
  }
  
  /**
   * Elimina un usuario
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async deleteUser(req, res) {
  try {
    const { id } = req.params;

      // No permitir eliminar el propio usuario
      if (parseInt(id) === req.user.id) {
        throw new ValidationError('No puedes eliminar tu propio usuario');
      }
      
      // Verificar que el usuario existe
      const user = await prismaClient.user.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }
      
      // Eliminar usuario (opcionalmente hacer un soft delete)
      await prismaClient.user.update({
        where: { id: parseInt(id) },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });

    // Registrar actividad
      await prismaClient.activityLog.create({
        data: {
      userId: req.user.id,
          action: 'DELETE_USER',
          entityType: 'User',
          entityId: id,
          details: `Usuario eliminado: ${user.email}`,
        },
      });
      
      return this.sendSuccess(res, null, 200, 'Usuario eliminado correctamente');
  } catch (error) {
      return this.handleError(error, res, 'deleteUser');
    }
  }
}

export default UserController;
