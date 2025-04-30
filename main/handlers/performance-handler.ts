import { prisma } from "../lib/prisma";
import { withErrorHandling } from "../utils/setup";
import { logger } from "../utils/logger";
import { PerformanceService } from "../services/performance-service";
import { PerformanceChannels } from "../channels/performance.channels";
import { ErrorHandler } from "../utils/error-handler";
import { ValidationService } from "../validations";

/**
 * Manejador de eventos IPC para operaciones relacionadas con el rendimiento
 */
export function setupPerformanceHandlers(): void {
  const validationService = ValidationService.getInstance();

  // Obtener todas las métricas de rendimiento
  withErrorHandling(PerformanceChannels.GET_ALL, async (_, filters) => {
    try {
      // Validar filtros
      validationService.validatePerformance(filters);

      const metrics = await PerformanceService.getAllMetrics(filters);
      return { metrics };
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error al obtener métricas:", error);
        throw ErrorHandler.createError("DatabaseError", error.message);
      }
      throw error;
    }
  });

  // Obtener una métrica por ID
  withErrorHandling(PerformanceChannels.GET_BY_ID, async (_, { id }) => {
    try {
      if (!id || typeof id !== "string") {
        throw ErrorHandler.createError(
          "ValidationError",
          "ID de métrica no válido"
        );
      }

      const metric = await PerformanceService.getMetricById(id);
      return { metric };
    } catch (error) {
      logger.error(`Error al obtener métrica ${id}:`, error);
      throw error;
    }
  });

  // Crear una nueva métrica
  withErrorHandling(PerformanceChannels.CREATE, async (_, data) => {
    try {
      // Validar datos de la métrica
      validationService.validatePerformance(data);

      const metric = await PerformanceService.createMetric(data);
      return {
        success: true,
        metric,
        message: "Métrica creada exitosamente",
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Error al crear métrica:", error);
        throw ErrorHandler.createError("DatabaseError", error.message);
      }
      throw error;
    }
  });

  // Actualizar una métrica
  withErrorHandling(PerformanceChannels.UPDATE, async (_, { id, data }) => {
    try {
      // Validar datos de actualización
      validationService.validatePerformance(data);

      const metric = await PerformanceService.updateMetric(id, data);
      return {
        success: true,
        metric,
        message: "Métrica actualizada exitosamente",
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error al actualizar métrica ${id}:`, error);
        throw ErrorHandler.createError("DatabaseError", error.message);
      }
      throw error;
    }
  });

  logger.info("Manejadores de rendimiento configurados");
}
