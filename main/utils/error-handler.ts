import { logger } from "./logger";
import { BrowserWindow, dialog } from "electron";

// Tipos de error personalizados para la aplicación
export type AppErrorType =
  | "ValidationError" // Errores de validación de datos
  | "AuthenticationError" // Errores de autenticación
  | "AuthorizationError" // Errores de permisos
  | "NotFoundError" // Recursos no encontrados
  | "DatabaseError" // Errores de base de datos
  | "FileSystemError" // Errores del sistema de archivos
  | "LimitExceeded" // Límites superados (ej: backups)
  | "NotImplementedError" // Funcionalidad no implementada
  | "UnknownError"; // Error no categorizado

// Interfaz para errores estandarizados
export interface IpcError {
  type: AppErrorType;
  message: string;
  stack?: string;
  data?: any;
}

export class ErrorHandler {
  private mainWindow: BrowserWindow | null = null;

  constructor(mainWindow?: BrowserWindow) {
    this.mainWindow = mainWindow || null;
  }

  /**
   * Configura el manejo de errores para la aplicación
   */
  public setupErrorHandling(): void {
    process.on("uncaughtException", (error) => {
      logger.error("Error no capturado:", error);
      this.showErrorDialog(
        "Error inesperado",
        "Ha ocurrido un error inesperado en la aplicación."
      );
    });

    process.on("unhandledRejection", (reason) => {
      logger.error("Promesa rechazada no manejada:", reason);
    });

    logger.info("Sistema de manejo de errores configurado");
  }

  /**
   * Muestra un diálogo de error al usuario
   */
  private showErrorDialog(title: string, message: string): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      dialog.showErrorBox(title, message);
    }
  }

  /**
   * Registra un error ocurrido durante una comunicación IPC
   */
  public static logError(channel: string, error: any): void {
    const errorType = error.type || "UnknownError";
    // Sanitizar información sensible antes de registrar
    const sanitizedError = ErrorHandler.sanitizeErrorForLogging(error);
    logger.error(
      `Error en canal IPC ${channel} [${errorType}]:`,
      sanitizedError
    );
  }

  /**
   * Sanitiza errores para evitar registrar información sensible
   */
  private static sanitizeErrorForLogging(error: any): any {
    if (!error) return error;

    // Clonar el error para no modificar el original
    const sanitized = { ...error };

    // Lista de propiedades potencialmente sensibles
    const sensitivePaths = [
      "password",
      "token",
      "auth",
      "key",
      "secret",
      "credential",
      "apiKey",
      "data.password",
      "data.token",
      "data.auth",
      "data.key",
      "data.secret",
      "data.credential",
      "data.apiKey",
      "stack",
    ];

    // Eliminar o sanitizar propiedades sensibles
    sensitivePaths.forEach((path) => {
      const parts = path.split(".");
      let current = sanitized;

      for (let i = 0; i < parts.length - 1; i++) {
        if (current && typeof current === "object" && parts[i] in current) {
          current = current[parts[i]];
        } else {
          return;
        }
      }

      const lastPart = parts[parts.length - 1];
      if (current && typeof current === "object" && lastPart in current) {
        if (lastPart === "stack") {
          // Para stack traces, mantener pero eliminar rutas absolutas
          if (typeof current[lastPart] === "string") {
            current[lastPart] = current[lastPart]
              .replace(/\(([A-Z]:)?[\\\/].*?[\\\/]/g, "(path/")
              .replace(/at ([A-Z]:)?[\\\/].*?[\\\/]/g, "at path/");
          }
        } else {
          // Para credenciales, reemplazar con [REDACTED]
          current[lastPart] = "[REDACTED]";
        }
      }
    });

    return sanitized;
  }

  /**
   * Formatea un error para devolverlo de forma estandarizada al proceso renderer
   */
  public static formatError(error: any): IpcError {
    // Si ya es un IpcError, lo devolvemos tal cual
    if (error && error.type && typeof error.message === "string") {
      return {
        type: error.type,
        message: error.message,
        stack: error.stack,
        data: error.data,
      };
    }

    // Error de Prisma (base de datos)
    if (error.code && error.clientVersion) {
      return {
        type: "DatabaseError",
        message: error.message || "Error en la base de datos",
        stack: error.stack,
      };
    }

    // Error genérico
    return {
      type: "UnknownError",
      message: error.message || "Ocurrió un error inesperado",
      stack: error.stack,
    };
  }

  /**
   * Crea un error con formato estandarizado
   */
  public static createError(
    type: AppErrorType,
    message: string,
    data?: any
  ): IpcError {
    return {
      type,
      message,
      data,
      stack: new Error().stack,
    };
  }
}
