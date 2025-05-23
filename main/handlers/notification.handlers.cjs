const { EventManager } = require("../events/event-manager.cjs");
const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { prisma } = require("../utils/prisma.cjs");
const { Notification } = require("electron");
const { AppError } = require("../utils/error-handler.cjs");

function registerNotificationHandlers() {
  const eventManager = EventManager.getInstance();

  const handlers = {
    [IPC_CHANNELS.NOTIFICATIONS.SHOW]: async (event, options) => {
      try {
        if (!options) {
          throw AppError.validation(
            "Opciones de notificación requeridas",
            "NOTIFICATION_OPTIONS_REQUIRED"
          );
        }

        // Validar datos requeridos
        if (!options.userId || !options.title || !options.message) {
          throw AppError.validation(
            "Datos de notificación incompletos",
            "INCOMPLETE_NOTIFICATION_DATA",
            { required: ["userId", "title", "message"] }
          );
        }

        // Crear notificación en base de datos
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

        // Mostrar notificación en sistema
        const systemNotification = new Notification({
          title: options.title,
          body: options.message,
          silent: options.priority === "low",
        });
        systemNotification.show();

        console.info("Notificación mostrada exitosamente", { 
          notificationId: notification.id,
          userId: options.userId,
          title: options.title 
        });
        return notification;
      } catch (error) {
        console.error("Error al mostrar notificación:", error);
        throw AppError.internal(
          "Error al mostrar notificación",
          "NOTIFICATION_SHOW_ERROR",
          { error: error.message }
        );
      }

      // Mostrar notificación nativa del sistema
      new Notification({
        title: options.title,
        body: options.message,
        silent: options.silent ?? false,
      }).show();

      // Notificar al frontend si hay un canal abierto
      event.sender.send(IPC_CHANNELS.NOTIFICATIONS.SHOW, notification);

      return notification;
    },

    [IPC_CHANNELS.NOTIFICATIONS.CLEAR]: async (event, id) => {
      const notification = await prisma.userNotification.delete({
        where: { id },
      });
      return notification;
    },

    [IPC_CHANNELS.NOTIFICATIONS.MARK_READ]: async (event, id) => {
      const notification = await prisma.userNotification.update({
        where: { id },
        data: { isRead: true },
      });
      return notification;
    },

    [IPC_CHANNELS.NOTIFICATIONS.GET_UNREAD]: async (event, userId) => {
      if (!userId) {
        throw new Error("Se requiere el ID del usuario");
      }

      const notifications = await prisma.userNotification.findMany({
        where: {
          userId,
          isRead: false,
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        include: {
          contract: {
            select: {
              id: true,
              number: true,
              title: true,
            },
          },
        },
      });

      return notifications;
    },
  };

  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerNotificationHandlers,
};
