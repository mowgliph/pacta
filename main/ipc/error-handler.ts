import { logger } from '../utils/logger';

// Tipos de error personalizados para la aplicación
export type AppErrorType = 
  | 'ValidationError'     // Errores de validación de datos
  | 'AuthenticationError' // Errores de autenticación
  | 'AuthorizationError'  // Errores de permisos
  | 'NotFoundError'       // Recursos no encontrados
  | 'DatabaseError'       // Errores de base de datos
  | 'FileSystemError'     // Errores del sistema de archivos
  | 'LimitExceeded'       // Límites superados (ej: backups)
  | 'NotImplementedError' // Funcionalidad no implementada
  | 'UnknownError';       // Error no categorizado

// Interfaz para errores estandarizados
export interface IpcError {
  type: AppErrorType;
  message: string;
  stack?: string;
  data?: any;
}

export class IpcErrorHandler {
  /**
   * Registra un error ocurrido durante una comunicación IPC
   */
  public static logError(channel: string, error: any): void {
    const errorType = error.type || 'UnknownError';
    logger.error(`Error en canal IPC ${channel} [${errorType}]:`, error);
  }

  /**
   * Formatea un error para devolverlo de forma estandarizada al proceso renderer
   */
  public static formatError(error: any): IpcError {
    // Si ya es un IpcError, lo devolvemos tal cual
    if (error && error.type && typeof error.message === 'string') {
      return {
        type: error.type,
        message: error.message,
        stack: error.stack,
        data: error.data
      };
    }

    // Error de Prisma (base de datos)
    if (error.code && error.clientVersion) {
      return {
        type: 'DatabaseError',
        message: error.message || 'Error en la base de datos',
        stack: error.stack
      };
    }

    // Error genérico
    return {
      type: 'UnknownError',
      message: error.message || 'Ocurrió un error inesperado',
      stack: error.stack
    };
  }

  /**
   * Crea un error con formato estandarizado
   */
  public static createError(type: AppErrorType, message: string, data?: any): IpcError {
    return {
      type,
      message,
      data,
      stack: new Error().stack
    };
  }
}