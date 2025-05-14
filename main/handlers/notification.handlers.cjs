const { EventManager } = require("../events/event-manager.cjs");
const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const logger = require("../utils/logger.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { withErrorHandling } = require("../utils/error-handler.cjs");
const { Notification } = require("electron");

function registerNotificationHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.NOTIFICATIONS.SHOW]: withErrorHandling(
      IPC_CHANNELS.NOTIFICATIONS.SHOW,
      async (event, options) => {
        logger.info("Mostrar notificación solicitada", { options });
        try {
          // Guardar en base de datos
          const notification = await prisma.userNotification.create({
            data: {
              userId: options.userId,
              title: options.title,
              message: options.message,
              type: options.type || "info",
              priority: options.priority || "medium",
              metadata: options.metadata || undefined,
              isRead: false,
              contractId: options.contractId || null,
              internalLink: options.internalLink || null,
            },
          });

          // Mostrar notificación nativa del sistema
          if (options.title && options.message) {
            new Notification({
              title: options.title,
              body: options.message,
              silent: options.silent ?? false,
            }).show();
          }

          // Enviar al frontend (si hay canal abierto)
          event.sender.send(IPC_CHANNELS.NOTIFICATIONS.SHOW, notification);
          return { success: true, data: notification };
        } catch (error) {
          logger.error("Error al mostrar notificación:", error);
          throw error;
        }
      }
    ),

    [IPC_CHANNELS.NOTIFICATIONS.CLEAR]: withErrorHandling(
      IPC_CHANNELS.NOTIFICATIONS.CLEAR,
      async (event, id) => {
        logger.info("Limpiar notificación solicitada", { id });
        try {
          // Marcar como leída
          await prisma.userNotification.update({
            where: { id },
            data: { isRead: true },
          });
          return { success: true, data: true };
        } catch (error) {
          logger.error("Error al limpiar notificación:", error);
          throw error;
        }
      }
    ),

    [IPC_CHANNELS.NOTIFICATIONS.MARK_READ]: withErrorHandling(
      IPC_CHANNELS.NOTIFICATIONS.MARK_READ,
      async (event, userId) => {
        logger.info("Marcar todas las notificaciones como leídas", { userId });
        try {
          await prisma.userNotification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
          });
          return { success: true, data: true };
        } catch (error) {
          logger.error("Error al marcar todas como leídas:", error);
          throw error;
        }
      }
    ),
  };

  eventManager.registerHandlers(handlers);
}

module.exports = { registerNotificationHandlers };
