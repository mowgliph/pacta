import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { User, License } from '../models/index.js';

// Rate limiter para prevenir ataques de fuerza bruta
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    message:
      'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.',
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

// Middleware para verificar el token JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Token no proporcionado',
      status: 401,
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expirado',
        status: 401,
      });
    }
    return res.status(403).json({
      message: 'Token inválido',
      status: 403,
    });
  }
};

// Middleware para verificar rol de administrador
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      message: 'Acceso denegado. Se requieren permisos de administrador.',
      status: 403,
    });
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
