const { logger } = require("./logger.cjs");
const { performanceService } = require("./performance-service.cjs");

/**
 * Monitor de rendimiento para el proceso principal
 */
exports.PerformanceMonitor = class PerformanceMonitor {
  static instance = null;
  monitoringInterval = null;
  MONITORING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

  static getInstance() {
    if (!exports.PerformanceMonitor.instance) {
      exports.PerformanceMonitor.instance = new exports.PerformanceMonitor();
    }
    return exports.PerformanceMonitor.instance;
  }

  /**
   * Inicia el monitoreo de rendimiento
   */
  startMonitoring() {
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
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info("Monitoreo de rendimiento detenido");
    }
  }

  /**
   * Verifica las métricas de rendimiento
   */
  checkPerformanceMetrics() {
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
  checkCacheSize() {
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
  async checkDatabaseConnections() {
    try {
      // Aquí podrías agregar lógica para verificar el estado de las conexiones
      // y optimizar según sea necesario
      logger.debug("Verificando conexiones de base de datos");
    } catch (error) {
      logger.error("Error al verificar conexiones de base de datos:", error);
    }
  }
};

// Exportar instancia única
exports.performanceMonitor = exports.PerformanceMonitor.getInstance();
