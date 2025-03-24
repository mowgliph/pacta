export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', code = 'AUTHENTICATION_ERROR') {
    super(message, 401, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized to perform this action', code = 'AUTHORIZATION_ERROR') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', code = 'DATABASE_ERROR') {
    super(message, 500, code);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'External service error', code = 'EXTERNAL_SERVICE_ERROR') {
    super(message, 502, code);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, code);
  }
}
