import { User, License, ActivityLog } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { BaseController } from './BaseController.js';
import UserService from '../../services/UserService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { ResponseService } from '../../services/ResponseService.js';
import { LoggingService } from '../../services/LoggingService.js';
import { CacheService } from '../../services/CacheService.js';
import { AuthenticationError, ValidationError } from '../../utils/errors.js';

/**
 * Controlador para la gestión de usuarios
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
      const userId = req.user.id; // Obtenido del middleware de autenticación
      const profileData = req.body;

      const updatedUser = await this.service.updateProfile(userId, profileData);

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
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
      const userId = req.user.id; // Obtenido del middleware de autenticación
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new ValidationError('Current password and new password are required');
      }

      await this.service.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
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
      const userId = req.user.id; // Obtenido del middleware de autenticación
      const user = await this.service.getById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
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

      if (!role) {
        throw new ValidationError('Role is required');
      }

      const updatedUser = await this.service.updateUserRole(id, role);

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
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

      if (!status) {
        throw new ValidationError('Status is required');
      }

      const updatedUser = await this.service.updateUserStatus(id, status);

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
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
}

export default new UserController();

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
      include: [
        {
          model: License,
          as: 'license',
          required: false,
        },
      ],
    });

    res.status(200).json({
      message: 'Usuarios obtenidos correctamente',
      data: users,
      status: 200,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      message: 'Error al obtener la lista de usuarios',
      error: error.message,
      status: 500,
    });
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
      include: [
        {
          model: License,
          as: 'license',
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        status: 404,
      });
    }

    res.status(200).json({
      message: 'Usuario obtenido correctamente',
      data: user,
      status: 200,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      message: 'Error al obtener el usuario',
      error: error.message,
      status: 500,
    });
  }
};

// Crear nuevo usuario
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, licenseId } = req.body;

    // Verificar si ya existe un usuario con el mismo username o email
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'El nombre de usuario o email ya está en uso',
        status: 400,
      });
    }

    // Crear el nuevo usuario
    const newUser = await User.create({
      username,
      email,
      password,
      role: role || 'readonly',
      licenseId,
      firstLogin: true,
      active: true,
    });

    // Registrar actividad
    await ActivityLog.create({
      userId: req.user.id,
      action: 'create_user',
      details: `Usuario ${newUser.username} creado por ${req.user.username}`,
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
      },
      status: 201,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      message: 'Error al crear el usuario',
      error: error.message,
      status: 500,
    });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role, active, licenseId } = req.body;

    // Verificar si el usuario existe
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        status: 404,
      });
    }

    // Verificar si el nuevo username o email ya está en uso
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: id } },
            {
              [Op.or]: [username ? { username } : null, email ? { email } : null].filter(Boolean),
            },
          ],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'El nombre de usuario o email ya está en uso',
          status: 400,
        });
      }
    }

    // Preparar datos para actualizar
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    if (active !== undefined) updateData.active = active;
    if (licenseId) updateData.licenseId = licenseId;

    // Actualizar usuario
    await user.update(updateData);

    // Registrar actividad
    await ActivityLog.create({
      userId: req.user.id,
      action: 'update_user',
      details: `Usuario ${user.username} actualizado por ${req.user.username}`,
    });

    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      message: 'Error al actualizar el usuario',
      error: error.message,
      status: 500,
    });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        status: 404,
      });
    }

    // Verificar que no se intente eliminar al admin principal
    if (user.role === 'admin' && user.username === 'admin') {
      return res.status(403).json({
        message: 'No se puede eliminar al usuario administrador principal',
        status: 403,
      });
    }

    // Eliminar usuario
    await user.destroy();

    // Registrar actividad
    await ActivityLog.create({
      userId: req.user.id,
      action: 'delete_user',
      details: `Usuario ${user.username} eliminado por ${req.user.username}`,
    });

    res.status(200).json({
      message: 'Usuario eliminado exitosamente',
      status: 200,
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      message: 'Error al eliminar el usuario',
      error: error.message,
      status: 500,
    });
  }
};

// Obtener el perfil del usuario actual
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
      include: [
        {
          model: License,
          as: 'license',
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        status: 404,
      });
    }

    res.status(200).json({
      message: 'Perfil obtenido correctamente',
      data: user,
      status: 200,
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      message: 'Error al obtener el perfil del usuario',
      error: error.message,
      status: 500,
    });
  }
};

// Actualizar el perfil del usuario actual
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    // Verificar si el usuario existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        status: 404,
      });
    }

    // Verificar si el nuevo email ya está en uso
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'El email ya está en uso',
          status: 400,
        });
      }
    }

    // Actualizar campos permitidos
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      message: 'Error al actualizar el perfil',
      error: error.message,
      status: 500,
    });
  }
};

// Cambiar contraseña del usuario actual
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Verificar si el usuario existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        status: 404,
      });
    }

    // Verificar contraseña actual
    const validPassword = await user.validatePassword(currentPassword);
    if (!validPassword) {
      return res.status(401).json({
        message: 'La contraseña actual es incorrecta',
        status: 401,
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.firstLogin = false;
    await user.save();

    // Registrar actividad
    await ActivityLog.create({
      userId,
      action: 'password_change',
      details: 'Contraseña cambiada por el usuario',
    });

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente',
      status: 200,
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      message: 'Error al cambiar la contraseña',
      error: error.message,
      status: 500,
    });
  }
};

// Cambiar estado de usuario (activar/desactivar)
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        status: 404,
      });
    }

    // Verificar que no se intente desactivar al admin principal
    if (user.role === 'admin' && user.username === 'admin') {
      return res.status(403).json({
        message: 'No se puede desactivar al usuario administrador principal',
        status: 403,
      });
    }

    // Cambiar estado
    user.active = !user.active;
    await user.save();

    // Registrar actividad
    await ActivityLog.create({
      userId: req.user.id,
      action: 'toggle_user_status',
      details: `Usuario ${user.username} ${user.active ? 'activado' : 'desactivado'} por ${req.user.username}`,
    });

    res.status(200).json({
      message: `Usuario ${user.active ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        id: user.id,
        username: user.username,
        active: user.active,
      },
      status: 200,
    });
  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    res.status(500).json({
      message: 'Error al cambiar el estado del usuario',
      error: error.message,
      status: 500,
    });
  }
};
