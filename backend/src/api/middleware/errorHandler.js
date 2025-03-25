import { Prisma } from '@prisma/client';
import { logger } from '../../utils/logger.js';
import { AppError, NotFoundError } from '../../utils/errors.js';
import { ValidationError } from 'sequelize';

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
  // Registrar el error
  const errorDetails = {
    url: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  
  // Log de nivel adecuado según el código de estado
  if (err.statusCode >= 500) {
    logger.error('Error del servidor', errorDetails);
  } else if (err.statusCode >= 400) {
    logger.warn('Error del cliente', errorDetails);
  } else {
    logger.error('Error no manejado', errorDetails);
  }
  
  // Si es un error de Sequelize, transformarlo a un error de validación
  if (err instanceof ValidationError) {
    const validationErrors = {};
    err.errors.forEach((error) => {
      validationErrors[error.path] = error.message;
    });
    
    return res.status(422).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Error de validación',
      errors: validationErrors
    });
  }
  
  // Si no es un error de la aplicación, crear uno genérico
  const error = err instanceof AppError
    ? err
    : new AppError(err.message || 'Error interno del servidor', 500, 'SERVER_ERROR');
  
  // Enviar respuesta al cliente
  const statusCode = error.statusCode || 500;
  const responseData = {
    status: 'error',
    code: error.code || 'SERVER_ERROR',
    message: error.message || 'Ocurrió un error inesperado',
  };
  
  // Incluir errores de validación si existen
  if (error.errors) {
    responseData.errors = error.errors;
  }
  
  // En desarrollo, incluir el stack trace
  if (process.env.NODE_ENV === 'development') {
    responseData.stack = error.stack;
  }
  
  return res.status(statusCode).json(responseData);
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.originalUrl}`));
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
