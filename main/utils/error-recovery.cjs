const { app } = require("electron");
const { logger } = require("./logger.cjs");
const { ErrorMonitorService } = require("./error-monitor.cjs");
const { AppError } = require("./error-handler.cjs");

exports.ErrorRecoveryManager = class ErrorRecoveryManager {
  static instance = null;
  mainWindow = null;
  errorMonitor = ErrorMonitorService.getInstance();
  isRecovering = false;

  constructor() {}

  static getInstance() {
    if (!exports.ErrorRecoveryManager.instance) {
      exports.ErrorRecoveryManager.instance =
        new exports.ErrorRecoveryManager();
    }
    return exports.ErrorRecoveryManager.instance;
  }

  setMainWindow(window) {
    this.mainWindow = window;
    this.errorMonitor.setMainWindow(window);
  }

  /**
   * Maneja un error crítico y coordina la recuperación
   */
  async handleCriticalError(error) {
    if (this.isRecovering) {
      logger.warn("Proceso de recuperación ya en curso");
      return;
    }
    this.isRecovering = true;
    logger.error("Iniciando manejo de error crítico:", error);
    try {
      this.errorMonitor.monitorError(error);
      await this.attemptRecovery(error);
      this.notifyUser(
        "Recuperación completada",
        "La aplicación se ha recuperado del error."
      );
    } catch (recoveryError) {
      logger.error("Error durante la recuperación:", recoveryError);
      this.handleRecoveryFailure();
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Intenta recuperar la aplicación según el tipo de error
   */
  async attemptRecovery(error) {
    const errorType = error instanceof AppError ? error.type : "UnknownError";
    switch (errorType) {
      case "DatabaseError":
        await this.recoverFromDatabaseError();
        break;
      case "FileSystemError":
        await this.recoverFromFileSystemError();
        break;
      case "AuthenticationError":
        await this.recoverFromAuthError();
        break;
      case "MemoryError":
        await this.recoverFromMemoryError();
        break;
      default:
        await this.performGeneralRecovery();
    }
  }

  /**
   * Recuperación de errores de base de datos
   */
  async recoverFromDatabaseError() {
    logger.info("Intentando recuperación de base de datos...");
    // Implementar reconexión a la base de datos
    // Verificar integridad
    // Restaurar último backup válido si es necesario
  }

  /**
   * Recuperación de errores del sistema de archivos
   */
  async recoverFromFileSystemError() {
    logger.info("Intentando recuperación del sistema de archivos...");
    // Verificar permisos de escritura/lectura
    // Liberar espacio si es necesario
    // Restaurar archivos desde backup si es necesario
  }

  /**
   * Recuperación de errores de autenticación
   */
  async recoverFromAuthError() {
    logger.info("Intentando recuperación de autenticación...");
    // Limpiar tokens expirados
    // Reiniciar estado de autenticación
    // Solicitar nueva autenticación si es necesario
  }

  /**
   * Recuperación de errores de memoria
   */
  async recoverFromMemoryError() {
    logger.info("Intentando recuperación de memoria...");
    // Liberar recursos no esenciales
    // Limpiar caché
    // Reiniciar procesos si es necesario
  }

  /**
   * Recuperación general para errores no específicos
   */
  async performGeneralRecovery() {
    logger.info("Realizando recuperación general...");
    // Verificar estado general de la aplicación
    // Reiniciar servicios críticos si es necesario
    // Restaurar estado predeterminado seguro
  }

  /**
   * Maneja el caso de fallo en la recuperación
   */
  handleRecoveryFailure() {
    logger.error("Fallo en la recuperación, preparando cierre seguro...");
    this.notifyUser(
      "Error Crítico",
      "No se pudo recuperar la aplicación. Se realizará un cierre seguro."
    );
    this.performSafeShutdown();
  }

  /**
   * Notifica al usuario sobre el estado de la recuperación
   */
  notifyUser(title, message) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("error:notification", {
        title,
        message,
        type: "error",
      });
    }
  }

  /**
   * Realiza un cierre seguro de la aplicación
   */
  performSafeShutdown() {
    logger.info("Iniciando cierre seguro de la aplicación...");
    setTimeout(() => {
      app.quit();
    }, 5000);
  }
};
