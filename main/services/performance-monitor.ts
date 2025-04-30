import { logger } from "../utils/logger";
import { performanceService } from "./performance-service";

/**
 * Monitor de rendimiento para el proceso principal
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MONITORING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Inicia el monitoreo de rendimiento
   */
  public startMonitoring(): void {
    if (this.monitoringInterval) {
      return;
    }

    logger.info("Iniciando monitoreo de rendimiento");

    this.monitoringInterval = setInterval(() => {
      this.checkPerformanceMetrics();
    }, this.MONITORING_INTERVAL_MS);

    // Monitoreo inicial
    this.checkPerformanceMetrics();
  }

  /**
   * Detiene el monitoreo de rendimiento
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info("Monitoreo de rendimiento detenido");
    }
  }

  /**
   * Verifica las métricas de rendimiento
   */
  private checkPerformanceMetrics(): void {
    try {
      // Monitorear uso de recursos
      performanceService.monitorResources();

      // Verificar tamaño de caché
      this.checkCacheSize();

      // Monitorear conexiones de base de datos
      this.checkDatabaseConnections();

      logger.info("Métricas de rendimiento verificadas");
    } catch (error) {
      logger.error("Error al verificar métricas de rendimiento:", error);
    }
  }

  /**
   * Verifica el tamaño de la caché
   */
  private checkCacheSize(): void {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    if (heapUsedMB > 512) {
      // Si el uso de memoria supera 512MB
      logger.warn(`Alto uso de memoria detectado: ${heapUsedMB}MB`);
      performanceService.clearCache(); // Limpiar caché para liberar memoria
    }
  }

  /**
   * Verifica las conexiones de base de datos
   */
  private async checkDatabaseConnections(): Promise<void> {
    try {
      // Aquí podrías agregar lógica para verificar el estado de las conexiones
      // y optimizar según sea necesario
      logger.debug("Verificando conexiones de base de datos");
    } catch (error) {
      logger.error("Error al verificar conexiones de base de datos:", error);
    }
  }
}

// Exportar instancia única
export const performanceMonitor = PerformanceMonitor.getInstance();
