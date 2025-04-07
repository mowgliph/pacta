/**
 * Middleware para manejar la autorización basada en roles
 */
import { ForbiddenError } from '../../utils/errors.js';

/**
 * Middleware que verifica si el usuario tiene alguno de los roles especificados
 * @param {string[]} roles - Array de roles permitidos
 * @returns {Function} Middleware de Express
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Usuario no autenticado'));
    }

    // Si no se requieren roles específicos, permitir acceso
    if (roles.length === 0) {
      return next();
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    if (roles.includes(req.user.role)) {
      return next();
    }

    // Si el usuario no tiene los roles necesarios, denegar acceso
    return next(new ForbiddenError('No tienes permisos suficientes para acceder a este recurso'));
  };
};

/**
 * Middleware que verifica si el usuario tiene el rol de administrador
 * @returns {Function} Middleware de Express
 */
export const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ForbiddenError('Usuario no autenticado'));
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  return next(new ForbiddenError('Se requieren permisos de administrador'));
};

/**
 * Middleware que verifica si el usuario puede acceder a un recurso (propio o admin)
 * @param {Function} getResourceUserIdFn - Función que obtiene el ID del usuario propietario del recurso
 * @returns {Function} Middleware de Express
 */
export const authorizeResource = getResourceUserIdFn => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Usuario no autenticado'));
    }

    try {
      // Administradores siempre tienen acceso
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Obtener el ID del propietario del recurso
      const resourceUserId = await getResourceUserIdFn(req);

      // Si el usuario es el propietario, permitir acceso
      if (resourceUserId === req.user.id) {
        return next();
      }

      // Denegar acceso
      return next(new ForbiddenError('No tienes permisos para acceder a este recurso'));
    } catch (error) {
      return next(error);
    }
  };
};
