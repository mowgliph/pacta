import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';

export function registerUserHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.USERS.LIST]: async (event) => {
      logger.info('Listado de usuarios solicitado');
      // TODO: Implementar lógica de listado de usuarios
      return [];
    },

    [IPC_CHANNELS.DATA.USERS.CREATE]: async (event, userData) => {
      logger.info('Creación de usuario solicitada', { userData });
      // TODO: Implementar lógica de creación de usuario
      return { id: 'new-user-id' };
    },

    [IPC_CHANNELS.DATA.USERS.UPDATE]: async (event, userData) => {
      logger.info('Actualización de usuario solicitada', { userData });
      // TODO: Implementar lógica de actualización de usuario
      return true;
    },

    [IPC_CHANNELS.DATA.USERS.DELETE]: async (event, id) => {
      logger.info('Eliminación de usuario solicitada', { id });
      // TODO: Implementar lógica de eliminación de usuario
      return true;
    }
  };

  eventManager.registerHandlers(handlers);
} 