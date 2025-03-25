import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';
import { UserRepository } from '../database/repositories/UserRepository.js';
import { LoggingService } from '../services/LoggingService.js';
import config from '../config/app.config.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { User, License } from '../models/index.js';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors.js';

const userRepository = new UserRepository();
const loggerService = new LoggingService('AuthMiddleware');

// Rate limiter para prevenir ataques de fuerza bruta
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    status: 'error',
    message: 'Demasiados intentos de inicio de sesión. Por favor, intenta nuevamente en 15 minutos.',
    code: 429
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validación de credenciales
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
 * Middleware para verificar token JWT
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Verificar si existe header de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('Se requiere token de autenticación');
    }

    // Extraer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Formato de token inválido');
    }

    const token = parts[1];

    // Verificar token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          firstName: true,
          lastName: true
        }
      });

      if (!user) {
        throw new UnauthorizedError('Usuario no encontrado');
      }

      // Verificar si el usuario está activo
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedError('Cuenta de usuario inactiva o suspendida');
      }

      // Adjuntar usuario a la request
      req.user = user;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Token inválido');
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error de autenticación', { error: error.message });
    next(error);
  }
};

/**
 * Middleware para verificar rol de administrador
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Se requiere autenticación'));
  }

  if (req.user.role !== 'ADMIN') {
    return next(new ForbiddenError('Se requieren permisos de administrador'));
  }

  next();
};

/**
 * Middleware para verificar que el usuario sea dueño del recurso o administrador
 * @param {Function} getResourceOwnerId - Función que devuelve el ID del propietario del recurso
 */
export const isOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Se requiere autenticación'));
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
      return next(new ForbiddenError('No tienes permiso para acceder a este recurso'));
    } catch (error) {
      logger.error('Error al verificar propiedad', { error: error.message });
      return next(error);
    }
  };
};

/**
 * Middleware para verificar permisos según roles
 * @param {Array<string>} allowedRoles - Roles permitidos
 */
export const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Se requiere autenticación'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('No tienes los permisos necesarios'));
    }

    next();
  };
};

/**
 * Genera tokens de acceso y refresco
 * @param {Object} user - Usuario
 * @returns {Object} Tokens generados
 */
export const generateTokens = (user) => {
  // Token de acceso (duración corta)
  const accessToken = jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Token de refresco (duración larga)
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Refresca el token de acceso
 * @param {string} refreshToken - Token de refresco
 * @returns {Object} Nuevo par de tokens
 */
export const refreshToken = async (refreshToken) => {
  try {
    // Verificar token de refresco
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    // Verificar si el usuario está activo
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Cuenta de usuario inactiva o suspendida');
    }

    // Generar nuevos tokens
    return generateTokens(user);
  } catch (error) {
    logger.error('Error al refrescar token', { error: error.message });
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token de refresco expirado');
    } else if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Token de refresco inválido');
    }
    throw error;
  }
};

// Middleware para verificar licencia activa
export const requiresLicense = async (req, res, next) => {
  try {
    // Buscar licencia activa
    const user = await User.findByPk(req.user.id, {
      include: [{ model: License, as: 'license' }],
    });

    if (!user.license || !user.license.active || new Date(user.license.expiryDate) < new Date()) {
      return res.status(403).json({
        message: 'Se requiere una licencia activa para acceder a esta funcionalidad',
        status: 403,
        requiresLicense: true,
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando licencia:', error);
    res.status(500).json({
      message: 'Error al verificar la licencia',
      status: 500,
    });
  }
};
