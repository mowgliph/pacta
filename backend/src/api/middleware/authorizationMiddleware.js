import { AuthorizationError } from '../utils/errors.js';
import { LoggingService } from '../services/LoggingService.js';
import { ForbiddenError } from '../../utils/errors.js';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';

const loggerService = new LoggingService('AuthorizationMiddleware');

/**
 * Middleware para la autorización basada en roles
 */
export const authorize = (roles) => {
  return (req, res, next) => {
    try {
      // Verificar que existe un usuario autenticado
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }
      
      // Normalizar roles a un array
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Verificar que el usuario tiene un rol permitido
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        logger.warn('Authorization failed: insufficient permissions', {
          userId: req.user.id,
          requiredRoles: allowedRoles,
          userRole: req.user.role,
        });
        
        throw new ForbiddenError('Insufficient permissions');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar que el usuario es propietario del recurso
 * @param {String} modelName - Nombre del modelo en Prisma (ej: 'user', 'contract')
 * @param {String} paramName - Nombre del parámetro que contiene el ID (ej: 'id', 'userId')
 * @param {Boolean} allowAdmin - Si se permite el acceso a administradores
 * @returns {Function} - Middleware de Express
 */
export const authorizeOwnership = (modelName, paramName = 'id', allowAdmin = true) => {
  return async (req, res, next) => {
    try {
      // Verificar que existe un usuario autenticado
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }
      
      // Si el usuario es admin y está permitido, pasar
      if (allowAdmin && req.user.role === 'ADMIN') {
        return next();
      }
      
      // Obtener el ID del recurso
      const resourceId = req.params[paramName];
      
      if (!resourceId) {
        throw new ForbiddenError(`Resource ID not provided (${paramName})`);
      }
      
      // Verificar que el modelo existe en Prisma
      if (!prisma[modelName]) {
        logger.error(`Model ${modelName} does not exist in Prisma`);
        throw new ForbiddenError('Invalid resource type');
      }
      
      // Buscar el recurso
      const resource = await prisma[modelName].findUnique({
        where: { id: parseInt(resourceId) },
      });
      
      if (!resource) {
        throw new ForbiddenError('Resource not found');
      }
      
      // Verificar propiedad (userId debe estar en el recurso)
      if (resource.userId !== req.user.id) {
        logger.warn('Ownership authorization failed', {
          userId: req.user.id,
          resourceId,
          modelName,
        });
        
        throw new ForbiddenError('You do not have permission to access this resource');
      }
      
      // Guardar el recurso en la solicitud para uso posterior
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Permission-based authorization middleware
 * @param {string} permission - Permission required to access the resource
 * @returns {Function} Express middleware
 */
export const authorizePermission = permission => {
  return (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      // Admin role has all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // For future implementation: Check if user has required permission
      // This would require a permissions table and user-permission mappings
      throw new AuthorizationError('Permission-based authorization not implemented');
    } catch (error) {
      next(error);
    }
  };
};
