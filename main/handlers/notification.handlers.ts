import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';

export function registerNotificationHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.NOTIFICATIONS.SHOW]: async (event, options) => {
      logger.info('Mostrar notificación solicitada', { options });
      try {
        // Guardar en base de datos
        const notification = await prisma.userNotification.create({
          data: {
            userId: options.userId,
            title: options.title,
            message: options.message,
            type: options.type || 'info',
            priority: options.priority || 'medium',
            metadata: options.metadata || undefined,
            isRead: false,
            contractId: options.contractId || null,
          } as any
        });
        // Enviar al frontend (si hay canal abierto)
        event.sender.send(IPC_CHANNELS.NOTIFICATIONS.SHOW, notification);
        return notification;
      } catch (error) {
        logger.error('Error al mostrar notificación:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.NOTIFICATIONS.CLEAR]: async (event, id) => {
      logger.info('Limpiar notificación solicitada', { id });
      try {
        // Marcar como leída
        await prisma.userNotification.update({
          where: { id },
          data: { isRead: true }
        });
        return true;
      } catch (error) {
        logger.error('Error al limpiar notificación:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.NOTIFICATIONS.MARK_READ]: async (event, userId) => {
      logger.info('Marcar todas las notificaciones como leídas', { userId });
      try {
        await prisma.userNotification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true }
        });
        return true;
      } catch (error) {
        logger.error('Error al marcar todas como leídas:', error);
        throw error;
      }
    }
  };

  eventManager.registerHandlers(handlers);
} 