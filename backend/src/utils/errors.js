/**
 * Custom error classes and error handling middleware for PACTA
 */

/**
 * Error base para todos los errores de la aplicación
 */
export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    this.code = code || 'SERVER_ERROR';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error para solicitudes no encontradas (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Error para solicitudes inválidas (400)
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

/**
 * Error para solicitudes no autorizadas (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Error para acceso prohibido (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Error para conflicto de recursos (409)
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Error para validación de datos (422)
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation error', errors = null) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Error para operaciones no soportadas (405)
 */
export class NotSupportedError extends AppError {
  constructor(message = 'Operation not supported') {
    super(message, 405, 'NOT_SUPPORTED');
  }
}

/**
 * Error para límite de rate excedido (429)
 */
export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Error para error interno del servidor (500)
 */
export class ServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR');
  }
}

/**
 * Error para servicio no disponible (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Middleware para manejar errores
 */
export const handleError = (err, req, res, next) => {
  // Si el error ya es un AppError, usarlo directamente
  const error =
    err instanceof AppError ? err : new ServerError(err.message || 'An unexpected error occurred');

  // Asegurarse de que hay un mensaje de error
  const message = error.message || 'An unexpected error occurred';

  // Crear la respuesta de error
  const errorResponse = {
    status: 'error',
    code: error.code,
    message,
  };

  // Agregar errores de validación si existen
  if (error instanceof ValidationError && error.errors) {
    errorResponse.errors = error.errors;
  }

  // Agregar información adicional en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = error.stack;
  }

  // Enviar respuesta
  res.status(error.statusCode || 500).json(errorResponse);
};

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Log error for debugging
    console.error('ERROR 💥', err);

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

// Async error handler wrapper
export const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Request validation middleware
export const validateRequest = schema => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(new ValidationError(error.message));
    }
  };
};
