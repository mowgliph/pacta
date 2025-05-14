const { logger } = require("./logger.cjs");
const { AppError } = require("./error-handler.cjs");

exports.ErrorMonitorService = class ErrorMonitorService {
  static instance = null;
  errorMetrics = new Map();
  metricsRetentionTime = 3600000; // 1 hora en milisegundos
  errorThreshold = 5;
  mainWindow = null;

  constructor() {}

  static getInstance() {
    if (!exports.ErrorMonitorService.instance) {
      exports.ErrorMonitorService.instance = new exports.ErrorMonitorService();
    }
    return exports.ErrorMonitorService.instance;
  }

  setMainWindow(window) {
    this.mainWindow = window;
  }

  /**
   * Registra y analiza un error para detectar patrones críticos
   */
  monitorError(error) {
    const errorType = error instanceof AppError ? error.type : "UnknownError";
    const currentTime = Date.now();
    this.cleanOldMetrics();
    const metrics = this.errorMetrics.get(errorType) || [];
    metrics.push({
      timestamp: currentTime,
      type: errorType,
      count: 1,
    });
    this.errorMetrics.set(errorType, metrics);
    this.analyzeErrorPatterns(errorType);
  }

  /**
   * Limpia métricas antiguas basadas en el tiempo de retención
   */
  cleanOldMetrics() {
    const currentTime = Date.now();
    for (const [type, metrics] of this.errorMetrics.entries()) {
      const validMetrics = metrics.filter(
        (metric) => currentTime - metric.timestamp < this.metricsRetentionTime
      );
      if (validMetrics.length > 0) {
        this.errorMetrics.set(type, validMetrics);
      } else {
        this.errorMetrics.delete(type);
      }
    }
  }

  /**
   * Analiza patrones de errores para detectar problemas críticos
   */
  analyzeErrorPatterns(errorType) {
    const metrics = this.errorMetrics.get(errorType) || [];
    const recentMetrics = metrics.filter(
      (m) => Date.now() - m.timestamp < 300000
    );
    if (recentMetrics.length >= this.errorThreshold) {
      this.handleCriticalError(errorType, recentMetrics.length);
    }
  }

  /**
   * Maneja errores críticos detectados
   */
  handleCriticalError(errorType, count) {
    logger.error(
      `Detectado patrón de error crítico: ${errorType} (${count} ocurrencias en 5 minutos)`
    );
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("error:critical", {
        type: errorType,
        count: count,
        message: `Se han detectado múltiples errores de tipo ${errorType}`,
      });
    }
    this.implementRecoveryActions(errorType);
  }

  /**
   * Implementa acciones de recuperación específicas según el tipo de error
   */
  implementRecoveryActions(errorType) {
    switch (errorType) {
      case "DatabaseError":
        this.handleDatabaseRecovery();
        break;
      case "FileSystemError":
        this.handleFileSystemRecovery();
        break;
      case "AuthenticationError":
        this.handleAuthRecovery();
        break;
      default:
        this.handleGenericRecovery();
    }
  }

  handleDatabaseRecovery() {
    logger.info("Iniciando recuperación de base de datos...");
  }

  handleFileSystemRecovery() {
    logger.info("Iniciando recuperación del sistema de archivos...");
  }

  handleAuthRecovery() {
    logger.info("Iniciando recuperación de autenticación...");
  }

  handleGenericRecovery() {
    logger.info("Iniciando recuperación genérica...");
  }
};
