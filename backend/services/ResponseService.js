export class ResponseService {
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      status: 'success',
      message,
      data,
      statusCode
    };
  }

  static error(message = 'Error occurred', statusCode = 500, code = 'INTERNAL_SERVER_ERROR', errors = null) {
    return {
      status: 'error',
      message,
      code,
      errors,
      statusCode
    };
  }

  static paginate(data, pagination, message = 'Success') {
    return {
      status: 'success',
      message,
      data,
      pagination,
      statusCode: 200
    };
  }

  static created(data, message = 'Resource created successfully') {
    return this.success(data, message, 201);
  }

  static updated(data, message = 'Resource updated successfully') {
    return this.success(data, message, 200);
  }

  static deleted(message = 'Resource deleted successfully') {
    return this.success(null, message, 200);
  }

  static notFound(message = 'Resource not found') {
    return this.error(message, 404, 'NOT_FOUND');
  }

  static validationError(errors, message = 'Validation failed') {
    return this.error(message, 400, 'VALIDATION_ERROR', errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return this.error(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Access forbidden') {
    return this.error(message, 403, 'FORBIDDEN');
  }

  static conflict(message = 'Resource already exists') {
    return this.error(message, 409, 'CONFLICT');
  }

  static tooManyRequests(message = 'Too many requests') {
    return this.error(message, 429, 'RATE_LIMIT_EXCEEDED');
  }

  static internalError(message = 'Internal server error') {
    return this.error(message, 500, 'INTERNAL_SERVER_ERROR');
  }

  static serviceUnavailable(message = 'Service unavailable') {
    return this.error(message, 503, 'SERVICE_UNAVAILABLE');
  }

  static badGateway(message = 'Bad gateway') {
    return this.error(message, 502, 'BAD_GATEWAY');
  }

  static gatewayTimeout(message = 'Gateway timeout') {
    return this.error(message, 504, 'GATEWAY_TIMEOUT');
  }
} 