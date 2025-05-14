const { prisma } = require("./prisma.cjs");

/**
 * Servicio para gestionar y optimizar el rendimiento de la aplicación
 */
exports.PerformanceService = class PerformanceService {
  static instance = null;
  queryCache = new Map();
  CACHE_EXPIRY_MS = 5 * 60 * 1000;

  constructor() {
    this.startPeriodicCleanup();
  }

  static getInstance() {
    if (!exports.PerformanceService.instance) {
      exports.PerformanceService.instance = new exports.PerformanceService();
    }
    return exports.PerformanceService.instance;
  }

  /**
   * Obtiene datos de la caché o ejecuta la consulta si no están disponibles
   */
  async getCachedData(key, queryFn) {
    const cached = this.queryCache.get(key);
    const now = Date.now();
    if (cached && now - cached.timestamp < this.CACHE_EXPIRY_MS) {
      console.debug(`Cache hit for key: ${key}`);
      return cached.data;
    }
    console.debug(`Cache miss for key: ${key}`);
    const data = await queryFn();
    this.queryCache.set(key, { data, timestamp: now });
    return data;
  }

  /**
   * Optimiza una consulta de base de datos utilizando técnicas eficientes
   */
  async optimizeQuery(queryFn) {
    const startTime = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;
      if (duration > 1000) {
        // Si la consulta tarda más de 1 segundo
        console.warn(`Consulta lenta detectada (${duration}ms)`);
      }
      return result;
    } catch (error) {
      console.error("[ERROR] Error en consulta optimizada:", error);
      throw error;
    }
  }

  /**
   * Invalida la caché para una clave específica
   */
  invalidateCache(key) {
    this.queryCache.delete(key);
    console.debug(`Cache invalidated for key: ${key}`);
  }

  /**
   * Limpia toda la caché
   */
  clearCache() {
    this.queryCache.clear();
    console.info("Cache cleared");
  }

  /**
   * Inicia la limpieza periódica de la caché
   */
  startPeriodicCleanup() {
    setInterval(() => {
      const now = Date.now();
      let expiredCount = 0;
      for (const [key, value] of this.queryCache.entries()) {
        if (now - value.timestamp > this.CACHE_EXPIRY_MS) {
          this.queryCache.delete(key);
          expiredCount++;
        }
      }
      if (expiredCount > 0) {
        console.debug(`Cleaned up ${expiredCount} expired cache entries`);
      }
    }, this.CACHE_EXPIRY_MS);
  }

  /**
   * Monitorea el uso de memoria y recursos
   */
  monitorResources() {
    const memoryUsage = process.memoryUsage();
    console.info("[INFO] Uso de memoria:", {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    });
  }

  static async getAllMetrics(filters) {
    return prisma.performanceMetric.findMany({
      where: filters,
    });
  }

  static async getMetricById(id) {
    return prisma.performanceMetric.findUnique({
      where: { id },
    });
  }

  static async createMetric(data) {
    return prisma.performanceMetric.create({
      data,
    });
  }

  static async updateMetric(id, data) {
    return prisma.performanceMetric.update({
      where: { id },
      data,
    });
  }
};

// Exportar instancia única
exports.performanceService = exports.PerformanceService.getInstance();
