import { logger } from "./logger";

/**
 * Clase para representar errores de la aplicación
 */
export class AppError extends Error {
  public readonly type: string;
  public readonly code?: string;
  public readonly statusCode: number;
  public readonly data?: any;

  constructor(
    message: string,
    type: string,
    statusCode: number = 500,
    code?: string,
    data?: any
  ) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;

    // Esto es necesario para que instanceof funcione correctamente
    Object.setPrototypeOf(this, AppError.prototype);

    // Registrar el error
    logger.error(`[${type}] ${message}`, { code, data });
  }

  /**
   * Error de validación (400)
   */
  static validation(message: string, code?: string, data?: any): AppError {
    return new AppError(message, "ValidationError", 400, code, data);
  }

  /**
   * Error de solicitud inválida (400)
   */
  static badRequest(message: string, code?: string, data?: any): AppError {
    return new AppError(message, "BadRequestError", 400, code, data);
  }

  /**
   * Error de autenticación (401)
   */
  static unauthorized(message: string, code?: string, data?: any): AppError {
    return new AppError(message, "AuthenticationError", 401, code, data);
  }

  /**
   * Error de autorización (403)
   */
  static forbidden(message: string, code?: string, data?: any): AppError {
    return new AppError(message, "AuthorizationError", 403, code, data);
  }

  /**
   * Error de recurso no encontrado (404)
   */
  static notFound(message: string, code?: string, data?: any): AppError {
    return new AppError(message, "NotFoundError", 404, code, data);
  }

  /**
   * Error de conflicto (409)
   */
  static conflict(message: string, code?: string, data?: any): AppError {
    return new AppError(message, "ConflictError", 409, code, data);
  }

  /**
   * Error del sistema (500)
   */
  static internal(message: string, code?: string, data?: any): AppError {
    return new AppError(message, "InternalError", 500, code, data);
  }

  /**
   * Error de base de datos (500)
   */
  static database(message: string, code?: string, data?: any): AppError {
    return new AppError(message, "DatabaseError", 500, code, data);
  }

  /**
   * Error de sistema de archivos (500)
   */
  static fileSystem(message: string, code?: string, data?: any): AppError {
    return new AppError(message, "FileSystemError", 500, code, data);
  }
}

export class ErrorHandler {
  static handle(error: Error) {
    if (error instanceof AppError) {
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
}

export function withErrorHandling(channel: string, handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  };
}
