import { AuthorizationError } from '../utils/errors.js';
import { LoggingService } from '../services/LoggingService.js';

const logger = new LoggingService('AuthorizationMiddleware');

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of roles allowed to access the resource
 * @returns {Function} Express middleware
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      // If no roles are specified, allow all authenticated users
      if (allowedRoles.length === 0) {
        return next();
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Unauthorized access attempt', {
          userId: req.user.id,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          path: req.originalUrl,
          method: req.method
        });
        
        throw new AuthorizationError('You do not have permission to access this resource');
      }

      // Log authorization
      logger.info('User authorized', {
        userId: req.user.id,
        role: req.user.role,
        path: req.originalUrl,
        method: req.method
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Resource ownership authorization middleware
 * @param {Function} getResourceUserId - Function to extract the user ID from the resource
 * @param {Array} bypassRoles - Array of roles that can bypass ownership check
 * @returns {Function} Express middleware
 */
export const authorizeOwnership = (getResourceUserId, bypassRoles = ['admin']) => {
  return async (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      // Allow bypass roles to access any resource
      if (bypassRoles.includes(req.user.role)) {
        return next();
      }

      // Get the user ID associated with the resource
      const resourceUserId = await getResourceUserId(req);

      // Check if user owns the resource
      if (req.user.id !== resourceUserId) {
        logger.warn('Unauthorized ownership access attempt', {
          userId: req.user.id,
          resourceUserId,
          path: req.originalUrl,
          method: req.method
        });
        
        throw new AuthorizationError('You do not have permission to access this resource');
      }

      // Log authorization
      logger.info('User ownership authorized', {
        userId: req.user.id,
        resourceUserId,
        path: req.originalUrl,
        method: req.method
      });

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
export const authorizePermission = (permission) => {
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