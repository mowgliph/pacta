import { Prisma } from '@prisma/client';
import { logger } from '../../utils/logger.js';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors.js';

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
  
  // Manejar errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Clave única violada
        return res.status(409).json({
          status: 'error',
          code: 'CONFLICT',
          message: 'Ya existe un registro con estos datos',
          fields: err.meta?.target
        });
      case 'P2025': // Registro no encontrado
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'Registro no encontrado'
        });
      case 'P2003': // Restricción de clave foránea
        return res.status(400).json({
          status: 'error',
          code: 'FOREIGN_KEY_CONSTRAINT',
          message: 'Referencia a registro no existente',
          field: err.meta?.field_name
        });
      default:
        logger.error('Prisma error', { code: err.code, message: err.message });
        return res.status(500).json({
          status: 'error',
          code: 'DATABASE_ERROR',
          message: 'Error en la base de datos'
        });
    }
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
