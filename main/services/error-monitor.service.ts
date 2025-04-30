import { BrowserWindow } from "electron";
import { logger } from "../lib/logger";
import { AppError } from "../middleware/error.middleware";
import { ErrorHandler } from "../utils/error-handler";

interface ErrorMetrics {
  timestamp: number;
  type: string;
  count: number;
}

export class ErrorMonitorService {
  private static instance: ErrorMonitorService;
  private errorMetrics: Map<string, ErrorMetrics[]>;
  private readonly metricsRetentionTime = 3600000; // 1 hora en milisegundos
  private readonly errorThreshold = 5; // Número de errores similares antes de tomar acción
  private mainWindow: BrowserWindow | null;

  private constructor() {
    this.errorMetrics = new Map();
    this.mainWindow = null;
  }

  public static getInstance(): ErrorMonitorService {
    if (!ErrorMonitorService.instance) {
      ErrorMonitorService.instance = new ErrorMonitorService();
    }
    return ErrorMonitorService.instance;
  }

  public setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Registra y analiza un error para detectar patrones críticos
   */
  public monitorError(error: Error | AppError): void {
    const errorType = error instanceof AppError ? error.type : "UnknownError";
    const currentTime = Date.now();

    // Limpiar métricas antiguas
    this.cleanOldMetrics();

    // Registrar nueva métrica
    const metrics = this.errorMetrics.get(errorType) || [];
    metrics.push({
      timestamp: currentTime,
      type: errorType,
      count: 1,
    });
    this.errorMetrics.set(errorType, metrics);

    // Analizar patrones
    this.analyzeErrorPatterns(errorType);
  }

  /**
   * Limpia métricas antiguas basadas en el tiempo de retención
   */
  private cleanOldMetrics(): void {
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
  private analyzeErrorPatterns(errorType: string): void {
    const metrics = this.errorMetrics.get(errorType) || [];
    const recentMetrics = metrics.filter(
      (m) => Date.now() - m.timestamp < 300000 // Últimos 5 minutos
    );

    if (recentMetrics.length >= this.errorThreshold) {
      this.handleCriticalError(errorType, recentMetrics.length);
    }
  }

  /**
   * Maneja errores críticos detectados
   */
  private handleCriticalError(errorType: string, count: number): void {
    logger.error(
      `Detectado patrón de error crítico: ${errorType} (${count} ocurrencias en 5 minutos)`
    );

    // Notificar al proceso de renderizado
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("error:critical", {
        type: errorType,
        count: count,
        message: `Se han detectado múltiples errores de tipo ${errorType}`,
      });
    }

    // Implementar acciones de recuperación según el tipo de error
    this.implementRecoveryActions(errorType);
  }

  /**
   * Implementa acciones de recuperación específicas según el tipo de error
   */
  private implementRecoveryActions(errorType: string): void {
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

  private handleDatabaseRecovery(): void {
    logger.info("Iniciando recuperación de base de datos...");
    // Implementar lógica de reconexión y verificación de integridad
  }

  private handleFileSystemRecovery(): void {
    logger.info("Iniciando recuperación del sistema de archivos...");
    // Implementar verificación de permisos y espacio disponible
  }

  private handleAuthRecovery(): void {
    logger.info("Iniciando recuperación de autenticación...");
    // Implementar limpieza de sesiones y tokens expirados
  }

  private handleGenericRecovery(): void {
    logger.info("Iniciando recuperación genérica...");
    // Implementar acciones de recuperación generales
  }
}
