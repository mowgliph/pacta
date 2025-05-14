const { logger } = require("./logger.cjs");

/**
 * Clase para representar errores de la aplicación
 */
exports.AppError = class AppError extends Error {
  type;
  code;
  statusCode;
  data;
  constructor(message, type, statusCode = 500, code, data) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;
    Object.setPrototypeOf(this, exports.AppError.prototype);
    logger.error(`[${type}] ${message}`, { code, data });
  }

  /**
   * Error de validación (400)
   */
  static validation(message, code, data) {
    return new exports.AppError(message, "ValidationError", 400, code, data);
  }

  /**
   * Error de solicitud inválida (400)
   */
  static badRequest(message, code, data) {
    return new exports.AppError(message, "BadRequestError", 400, code, data);
  }

  /**
   * Error de autenticación (401)
   */
  static unauthorized(message, code, data) {
    return new exports.AppError(
      message,
      "AuthenticationError",
      401,
      code,
      data
    );
  }

  /**
   * Error de autorización (403)
   */
  static forbidden(message, code, data) {
    return new exports.AppError(message, "AuthorizationError", 403, code, data);
  }

  /**
   * Error de recurso no encontrado (404)
   */
  static notFound(message, code, data) {
    return new exports.AppError(message, "NotFoundError", 404, code, data);
  }

  /**
   * Error de conflicto (409)
   */
  static conflict(message, code, data) {
    return new exports.AppError(message, "ConflictError", 409, code, data);
  }

  /**
   * Error del sistema (500)
   */
  static internal(message, code, data) {
    return new exports.AppError(message, "InternalError", 500, code, data);
  }

  /**
   * Error de base de datos (500)
   */
  static database(message, code, data) {
    return new exports.AppError(message, "DatabaseError", 500, code, data);
  }

  /**
   * Error de sistema de archivos (500)
   */
  static fileSystem(message, code, data) {
    return new exports.AppError(message, "FileSystemError", 500, code, data);
  }
};

exports.ErrorHandler = class ErrorHandler {
  static handle(error) {
    if (error instanceof exports.AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
        },
      };
    }
    return {
      success: false,
      error: {
        message: "Error interno del servidor",
        code: "INTERNAL_SERVER_ERROR",
        statusCode: 500,
      },
    };
  }
};

exports.withErrorHandling = function (channel, handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof Error) {
        return exports.ErrorHandler.handle(error);
      }
      return exports.ErrorHandler.handle(new Error(String(error)));
    }
  };
};
