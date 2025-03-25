import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors.js';
import { UserRepository } from '../database/repositories/UserRepository.js';
import { LoggingService } from '../services/LoggingService.js';
import config from '../config/app.config.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { User, License } from '../models/index.js';

const userRepository = new UserRepository();
const logger = new LoggingService('AuthMiddleware');

// Rate limiter para prevenir ataques de fuerza bruta
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    message: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.',
    status: 429,
  },
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

// Middleware principal de autenticación
export const authenticate = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthenticationError('Authentication token required');
    }

    // Extract token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid token format');
    }

    const token = parts[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired');
      }
      throw new AuthenticationError('Invalid token');
    }

    // Get user from database
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AuthenticationError('User account is not active');
    }

    // Check if user has a valid license
    if (user.license && (!user.license.active || new Date(user.license.expiryDate) < new Date())) {
      throw new AuthenticationError('License expired or inactive');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      licenseType: user.license?.type,
    };

    // Log authentication
    logger.info('User authenticated', { userId: user.id, email: user.email });

    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message });
    next(error);
  }
};

// Generación de tokens
export const generateTokens = user => {
  // Generate access token
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  // Generate refresh token
  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

// Renovación de token
export const refreshToken = async refreshToken => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    // Get user from database
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AuthenticationError('User account is not active');
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Update refresh token in database
    await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  } catch (error) {
    logger.error('Token refresh failed', { error: error.message });
    throw new AuthenticationError('Invalid refresh token');
  }
};

// Middleware para verificar rol de administrador
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    throw new AuthenticationError('Se requieren permisos de administrador');
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
