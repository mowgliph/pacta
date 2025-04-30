import { ipcMain } from "electron";
import { logger } from "../utils/logger";
import { performanceService } from "../services/performance-service";
import { performanceMonitor } from "../services/performance-monitor";

/**
 * Manejador de eventos IPC para operaciones relacionadas con el rendimiento
 */
export function setupPerformanceHandlers(): void {
  // Iniciar monitoreo de rendimiento
  ipcMain.handle("performance:start-monitoring", async () => {
    try {
      performanceMonitor.startMonitoring();
      return { success: true, message: "Monitoreo de rendimiento iniciado" };
    } catch (error) {
      logger.error("Error al iniciar monitoreo:", error);
      throw error;
    }
  });

  // Detener monitoreo de rendimiento
  ipcMain.handle("performance:stop-monitoring", async () => {
    try {
      performanceMonitor.stopMonitoring();
      return { success: true, message: "Monitoreo de rendimiento detenido" };
    } catch (error) {
      logger.error("Error al detener monitoreo:", error);
      throw error;
    }
  });

  // Obtener métricas de rendimiento
  ipcMain.handle("performance:get-metrics", async () => {
    try {
      const memoryUsage = process.memoryUsage();
      return {
        success: true,
        metrics: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
        },
      };
    } catch (error) {
      logger.error("Error al obtener métricas:", error);
      throw error;
    }
  });

  // Limpiar caché
  ipcMain.handle("performance:clear-cache", async () => {
    try {
      performanceService.clearCache();
      return { success: true, message: "Caché limpiada exitosamente" };
    } catch (error) {
      logger.error("Error al limpiar caché:", error);
      throw error;
    }
  });

  // Invalidar caché específica
  ipcMain.handle(
    "performance:invalidate-cache",
    async (_event, key: string) => {
      try {
        performanceService.invalidateCache(key);
        return { success: true, message: `Caché invalidada para: ${key}` };
      } catch (error) {
        logger.error("Error al invalidar caché:", error);
        throw error;
      }
    }
  );

  logger.info("Manejadores de rendimiento configurados");
}
