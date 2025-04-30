import { logger } from "../utils/logger";
import { prisma } from "../lib/prisma";

/**
 * Servicio para gestionar y optimizar el rendimiento de la aplicación
 */
export class PerformanceService {
  private static instance: PerformanceService;

  // Caché para consultas frecuentes
  private queryCache: Map<string, { data: any; timestamp: number }> = new Map();

  // Tiempo de expiración de caché (5 minutos)
  private readonly CACHE_EXPIRY_MS = 5 * 60 * 1000;

  private constructor() {
    this.startPeriodicCleanup();
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  /**
   * Obtiene datos de la caché o ejecuta la consulta si no están disponibles
   */
  public async getCachedData<T>(
    key: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.queryCache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_EXPIRY_MS) {
      logger.debug(`Cache hit for key: ${key}`);
      return cached.data;
    }

    logger.debug(`Cache miss for key: ${key}`);
    const data = await queryFn();
    this.queryCache.set(key, { data, timestamp: now });
    return data;
  }

  /**
   * Optimiza una consulta de base de datos utilizando técnicas eficientes
   */
  public async optimizeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      if (duration > 1000) {
        // Si la consulta tarda más de 1 segundo
        logger.warn(`Consulta lenta detectada (${duration}ms)`);
      }

      return result;
    } catch (error) {
      logger.error("Error en consulta optimizada:", error);
      throw error;
    }
  }

  /**
   * Invalida la caché para una clave específica
   */
  public invalidateCache(key: string): void {
    this.queryCache.delete(key);
    logger.debug(`Cache invalidated for key: ${key}`);
  }

  /**
   * Limpia toda la caché
   */
  public clearCache(): void {
    this.queryCache.clear();
    logger.info("Cache cleared");
  }

  /**
   * Inicia la limpieza periódica de la caché
   */
  private startPeriodicCleanup(): void {
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
        logger.debug(`Cleaned up ${expiredCount} expired cache entries`);
      }
    }, this.CACHE_EXPIRY_MS);
  }

  /**
   * Monitorea el uso de memoria y recursos
   */
  public monitorResources(): void {
    const memoryUsage = process.memoryUsage();
    logger.info("Uso de memoria:", {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
    });
  }
}

// Exportar instancia única
export const performanceService = PerformanceService.getInstance();
