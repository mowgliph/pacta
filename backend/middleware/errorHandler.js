import { AppError } from '../utils/errors.js';
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

// Middleware para manejar errores de Sequelize
export const handleSequelizeError = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));

    return res.status(400).json({
      status: 'fail',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      status: 'fail',
      code: 'UNIQUE_CONSTRAINT_ERROR',
      message: 'Duplicate entry',
      errors: err.errors.map(error => ({
        field: error.path,
        message: error.message
      }))
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      status: 'fail',
      code: 'FOREIGN_KEY_ERROR',
      message: 'Invalid reference to related record',
      errors: err.errors.map(error => ({
        field: error.path,
        message: error.message
      }))
    });
  }

  next(err);
};

// Middleware principal de manejo de errores
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production mode
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        code: err.code,
        message: err.message
      });
    } else {
      // Programming or unknown errors
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong!'
      });
    }
  }
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
      message: 'Invalid token. Please log in again!'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      code: 'TOKEN_EXPIRED',
      message: 'Your token has expired! Please log in again.'
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