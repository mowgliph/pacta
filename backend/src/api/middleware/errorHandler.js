import { Prisma } from '@prisma/client';
import { logger } from '../../utils/logger.js';

// Clase personalizada para errores de la aplicación
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware principal de manejo de errores
export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user?.id
  });

  // Manejar errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          status: 'error',
          message: 'Ya existe un registro con estos datos',
          field: err.meta?.target?.[0]
        });
      case 'P2025':
        return res.status(404).json({
          status: 'error',
          message: 'Registro no encontrado'
        });
      case 'P2003':
        return res.status(400).json({
          status: 'error',
          message: 'Referencia a registro no existente',
          field: err.meta?.field_name
        });
      default:
        return res.status(500).json({
          status: 'error',
          message: 'Error en la base de datos'
        });
    }
  }

  // Manejar errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Manejar errores de autenticación
  if (err.name === 'AuthenticationError') {
    return res.status(401).json({
      status: 'error',
      message: err.message
    });
  }

  // Manejar errores de autorización
  if (err.name === 'AuthorizationError') {
    return res.status(403).json({
      status: 'error',
      message: err.message
    });
  }

  // Manejar errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expirado'
    });
  }

  // Manejar errores de archivo
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error al subir archivo',
      error: err.message
    });
  }

  // Error por defecto
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor'
  });
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

// Middleware para validar JWT
export const handleJWTError = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      code: 'INVALID_TOKEN',
      message: 'Invalid token. Please log in again!',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      code: 'TOKEN_EXPIRED',
      message: 'Your token has expired! Please log in again.',
    });
  }

  next(err);
};

// Middleware para validar roles
export const validateRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permiso para realizar esta acción', 403));
    }
    next();
  };
};
