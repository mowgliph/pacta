import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';

export function registerSupplementHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.SUPPLEMENTS.LIST]: async (event, contractId) => {
      logger.info('Listado de suplementos solicitado', { contractId });
      // TODO: Implementar lógica de listado de suplementos
      return [];
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.CREATE]: async (event, contractId, supplementData) => {
      logger.info('Creación de suplemento solicitada', { contractId, supplementData });
      // TODO: Implementar lógica de creación de suplemento
      return { id: 'new-supplement-id' };
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.UPDATE]: async (event, id, supplementData) => {
      logger.info('Actualización de suplemento solicitada', { id, supplementData });
      // TODO: Implementar lógica de actualización de suplemento
      return true;
    },

    [IPC_CHANNELS.DATA.SUPPLEMENTS.DELETE]: async (event, id) => {
      logger.info('Eliminación de suplemento solicitada', { id });
      // TODO: Implementar lógica de eliminación de suplemento
      return true;
    }
  };

  eventManager.registerHandlers(handlers);
} 