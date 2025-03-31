/**
 * Middleware unificado para autenticación y autorización
 * Combina todas las funcionalidades relacionadas con seguridad, autenticación y permisos
 */
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { 
  UnauthorizedError, 
  ForbiddenError, 
} from '../../utils/errors.js';
import { AuthorizationError } from '../utils/errors.js';
import { LoggingService } from '../../services/LoggingService.js';
import config from '../../config/app.config.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

// Instanciar servicios
const loggerService = new LoggingService('AuthMiddleware');

/**
 * SECCIÓN 1: MIDDLEWARES DE SEGURIDAD Y RATE LIMITING
 */

// Rate limiter para prevenir ataques de fuerza bruta en login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    status: 'error',
    message: 'Demasiados intentos de inicio de sesión. Por favor, intenta nuevamente en 15 minutos.',
    code: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para operaciones sensibles
export const sensitiveRouteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 intentos
  message: {
    status: 'error',
    message: 'Demasiadas operaciones sensibles. Por favor, intenta nuevamente más tarde.',
    code: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * SECCIÓN 2: VALIDACIÓN DE SOLICITUDES
 */

// Validación de credenciales para login
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Error de validación',
        errors: errors.array().reduce((acc, err) => {
          acc[err.param] = [err.msg];
          return acc;
        }, {}),
      });
    }
    next();
  },
];

/**
 * SECCIÓN 3: MIDDLEWARES DE AUTENTICACIÓN
 */

/**
 * Middleware para verificar que el usuario está autenticado
 * Verifica el token JWT y adjunta el usuario a la solicitud
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Invalid authentication token');
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);

      // Verificar que el usuario existe y está activo
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedError('User account is not active');
      }

      // Almacenar el usuario en el objeto de solicitud
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Authentication token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid authentication token');
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    return next(error);
  }
};

/**
 * Genera tokens de acceso y refresco para un usuario
 * @param {Object} user - Usuario autenticado
 * @returns {Object} - Tokens generados
 */
export const generateTokens = user => {
  // Datos a incluir en el token
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Generar token de acceso (corta duración)
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn || '15m',
  });

  // Generar token de refresco (larga duración)
  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret || config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn || '7d',
  });

  // Guardar el token de refresco en la base de datos
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días por defecto

  prisma.refreshToken
    .create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })
    .catch(error => {
      logger.error('Error saving refresh token', { userId: user.id, error: error.message });
    });

  return { accessToken, refreshToken };
};

/**
 * Refresca el token de acceso utilizando un token de refresco
 * @param {String} refreshToken - Token de refresco
 * @returns {Promise<Object>} - Nuevos tokens
 */
export const refreshAccessToken = async refreshToken => {
  try {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    // Verificar que el token existe en la base de datos
    const tokenData = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenData) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Verificar que el token no ha expirado
    if (new Date() > new Date(tokenData.expiresAt)) {
      // Eliminar token expirado
      await prisma.refreshToken.delete({
        where: { id: tokenData.id },
      });

      throw new UnauthorizedError('Refresh token has expired');
    }

    // Verificar la firma del token
    try {
      jwt.verify(refreshToken, config.jwt.refreshSecret || config.jwt.secret);
    } catch (error) {
      // Eliminar token inválido
      await prisma.refreshToken.delete({
        where: { id: tokenData.id },
      });

      throw new UnauthorizedError('Invalid refresh token');
    }

    // Generar nuevos tokens
    const tokens = generateTokens(tokenData.user);

    // Eliminar el token de refresco antiguo
    await prisma.refreshToken.delete({
      where: { id: tokenData.id },
    });

    return tokens;
  } catch (error) {
    logger.error('Error refreshing token', { error: error.message });
    throw error;
  }
};

/**
 * SECCIÓN 4: MIDDLEWARES DE AUTORIZACIÓN
 */

/**
 * Middleware para la autorización basada en roles
 * @param {String|Array} roles - Rol o roles permitidos
 * @returns {Function} - Middleware de Express
 */
export const authorize = roles => {
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
 * Middleware para verificar rol de administrador 
 * (Atajo para authorize('ADMIN'))
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== 'ADMIN') {
    return next(new ForbiddenError('Administrator permissions required'));
  }

  next();
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
 * Middleware para verificar que el usuario sea dueño del recurso o administrador
 * Versión alternativa que utiliza una función para obtener el ID del propietario
 * @param {Function} getResourceOwnerId - Función que devuelve el ID del propietario del recurso
 */
export const isOwnerOrAdmin = getResourceOwnerId => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Si es admin, permitir acceso
    if (req.user.role === 'ADMIN') {
      return next();
    }

    try {
      // Obtener ID del propietario
      const ownerId = await getResourceOwnerId(req);

      // Verificar si el usuario es propietario
      if (req.user.id === ownerId) {
        return next();
      }

      // Si no es propietario ni admin, denegar acceso
      return next(new ForbiddenError('You do not have permission to access this resource'));
    } catch (error) {
      logger.error('Error verifying ownership', { error: error.message });
      return next(error);
    }
  };
};

/**
 * Middleware para verificar permisos específicos
 * @param {string} permission - Permiso requerido para acceder al recurso
 * @returns {Function} Middleware de Express
 */
export const authorizePermission = permission => {
  return (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        throw new AuthorizationError('User not authenticated');
      }

      // Admin role has all permissions
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Para implementación futura: Verificar si el usuario tiene el permiso requerido
      // Esto requeriría una tabla de permisos y mapeos de usuario-permiso
      throw new AuthorizationError('Permission-based authorization not implemented');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * SECCIÓN 5: FUNCIONALIDADES ESPECÍFICAS DE NEGOCIO
 */

/**
 * Middleware para verificar licencia activa
 */
export const requiresLicense = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Buscar licencia activa
    const license = await prisma.license.findFirst({
      where: {
        userId: req.user.id,
        active: true,
        expiryDate: {
          gt: new Date() // Fecha de expiración mayor que la fecha actual
        }
      }
    });

    if (!license) {
      return res.status(403).json({
        message: 'An active license is required to access this feature',
        status: 403,
        requiresLicense: true,
      });
    }

    // Adjuntar la licencia a la solicitud para uso posterior
    req.license = license;
    next();
  } catch (error) {
    logger.error('Error verifying license', { userId: req.user?.id, error: error.message });
    next(error);
  }
};

// Exportar todo el módulo
export default {
  // Seguridad
  loginLimiter,
  sensitiveRouteLimiter,
  
  // Validación
  validateLogin,
  
  // Autenticación
  authenticate,
  generateTokens,
  refreshAccessToken,
  
  // Autorización
  authorize,
  isAdmin,
  authorizeOwnership,
  isOwnerOrAdmin,
  authorizePermission,
  
  // Funcionalidades específicas
  requiresLicense
};