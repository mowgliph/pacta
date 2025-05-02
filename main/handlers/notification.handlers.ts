import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';

export function registerNotificationHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.NOTIFICATIONS.SHOW]: async (event, options) => {
      logger.info('Mostrar notificación solicitada', { options });
      // TODO: Implementar lógica de mostrar notificación
      return true;
    },

    [IPC_CHANNELS.NOTIFICATIONS.CLEAR]: async (event, id) => {
      logger.info('Limpiar notificación solicitada', { id });
      // TODO: Implementar lógica de limpiar notificación
      return true;
    }
  };

  eventManager.registerHandlers(handlers);
} 