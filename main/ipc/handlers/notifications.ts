import { withErrorHandling } from "../setup";
import { ErrorHandler } from "../error-handler";
import { logger } from "../../utils/logger";
import { NotificationService } from "../services/notification.service";
import { z } from "zod";

// Esquemas de validación
const notificationFilterSchema = z.object({
  userId: z.string().uuid(),
  isRead: z.boolean().optional(),
  type: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

const notificationMarkReadSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});

/**
 * Configurar manejadores IPC para notificaciones
 */
export function setupNotificationHandlers(): void {
  logger.info("Configurando manejadores IPC para notificaciones");

  // Obtenemos la instancia del servicio de notificaciones
  const notificationService = NotificationService.getInstance();

  // Obtener notificaciones de un usuario
  withErrorHandling(
    "notifications:getByUser",
    async (_, userId: string, filters: any = {}) => {
      try {
        if (!userId) {
          throw ErrorHandler.createError(
            "ValidationError",
            "El ID del usuario es requerido"
          );
        }

        // Aseguramos que userId es siempre un campo obligatorio
        const validatedFilters = {
          userId, // Esto garantiza que userId es una cadena no opcional
          isRead: filters.read,
          type: filters.type,
          page: filters.page || 1,
          limit: filters.limit || 10,
        };

        // Validamos los datos con el esquema
        notificationFilterSchema.parse(validatedFilters);

        return await notificationService.getUserNotifications(validatedFilters);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors = error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          }));

          logger.warn(
            "Error de validación al obtener notificaciones:",
            validationErrors
          );
          throw ErrorHandler.createError(
            "ValidationError",
            `Error de validación: ${validationErrors[0].message}`,
            validationErrors
          );
        }

        logger.error("Error al obtener notificaciones:", error);
        throw error;
      }
    }
  );

  // Marcar notificación como leída
  withErrorHandling(
    "notifications:markAsRead",
    async (_, notificationId: string, userId: string) => {
      try {
        // Validar datos
        const validatedData = notificationMarkReadSchema.parse({
          id: notificationId,
          userId,
        });

        const success = await notificationService.markAsRead(
          validatedData.id,
          validatedData.userId
        );

        if (!success) {
          throw ErrorHandler.createError(
            "NotFoundError",
            "Notificación no encontrada o sin permisos"
          );
        }

        logger.info(
          `Notificación marcada como leída: ${notificationId} por usuario ${userId}`
        );
        return { success: true };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors = error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          }));

          logger.warn(
            "Error de validación al marcar notificación:",
            validationErrors
          );
          throw ErrorHandler.createError(
            "ValidationError",
            `Error de validación: ${validationErrors[0].message}`,
            validationErrors
          );
        }

        logger.error(
          `Error al marcar notificación ${notificationId} como leída:`,
          error
        );
        throw error;
      }
    }
  );

  // Marcar todas las notificaciones como leídas
  withErrorHandling(
    "notifications:markAllAsRead",
    async (_, userId: string) => {
      try {
        if (!userId) {
          throw ErrorHandler.createError(
            "ValidationError",
            "El ID del usuario es requerido"
          );
        }

        const count = await notificationService.markAllAsRead(userId);

        logger.info(
          `${count} notificaciones marcadas como leídas para usuario ${userId}`
        );
        return { success: true, count };
      } catch (error) {
        logger.error(
          `Error al marcar todas las notificaciones como leídas para usuario ${userId}:`,
          error
        );
        throw error;
      }
    }
  );

  // Obtener contador de notificaciones no leídas
  withErrorHandling(
    "notifications:getUnreadCount",
    async (_, userId: string) => {
      try {
        if (!userId) {
          throw ErrorHandler.createError(
            "ValidationError",
            "El ID del usuario es requerido"
          );
        }

        const count = await notificationService.getUnreadCount(userId);

        return { count };
      } catch (error) {
        logger.error(
          `Error al obtener contador de notificaciones no leídas para usuario ${userId}:`,
          error
        );
        throw error;
      }
    }
  );

  // Eliminar notificación
  withErrorHandling(
    "notifications:delete",
    async (_, notificationId: string, userId: string) => {
      try {
        if (!notificationId) {
          throw ErrorHandler.createError(
            "ValidationError",
            "El ID de la notificación es requerido"
          );
        }

        if (!userId) {
          throw ErrorHandler.createError(
            "ValidationError",
            "El ID del usuario es requerido"
          );
        }

        const success = await notificationService.deleteNotification(
          notificationId,
          userId
        );

        if (!success) {
          throw ErrorHandler.createError(
            "NotFoundError",
            "Notificación no encontrada o sin permisos"
          );
        }

        logger.info(
          `Notificación eliminada: ${notificationId} por usuario ${userId}`
        );
        return { success: true };
      } catch (error) {
        logger.error(
          `Error al eliminar notificación ${notificationId}:`,
          error
        );
        throw error;
      }
    }
  );

  // Crear una notificación (generalmente solo se usa internamente)
  withErrorHandling("notifications:create", async (_, notificationData) => {
    try {
      const newNotification = await notificationService.createNotification(
        notificationData
      );

      logger.info(
        `Notificación creada: ${newNotification.id} para usuario ${newNotification.userId}`
      );
      return newNotification;
    } catch (error) {
      logger.error("Error al crear notificación:", error);
      throw error;
    }
  });
}
