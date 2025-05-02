import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';

export function registerContractHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.CONTRACTS.LIST]: async (event, filters) => {
      logger.info('Listado de contratos solicitado', { filters });
      // TODO: Implementar lógica de listado de contratos
      return [];
    },

    [IPC_CHANNELS.DATA.CONTRACTS.CREATE]: async (event, contractData) => {
      logger.info('Creación de contrato solicitada', { contractData });
      // TODO: Implementar lógica de creación de contrato
      return { id: 'new-contract-id' };
    },

    [IPC_CHANNELS.DATA.CONTRACTS.UPDATE]: async (event, id, contractData) => {
      logger.info('Actualización de contrato solicitada', { id, contractData });
      // TODO: Implementar lógica de actualización de contrato
      return true;
    },

    [IPC_CHANNELS.DATA.CONTRACTS.DELETE]: async (event, id) => {
      logger.info('Eliminación de contrato solicitada', { id });
      // TODO: Implementar lógica de eliminación de contrato
      return true;
    },

    [IPC_CHANNELS.DATA.CONTRACTS.EXPORT]: async (event, id) => {
      logger.info('Exportación de contrato solicitada', { id });
      // TODO: Implementar lógica de exportación de contrato
      return { path: 'exported-contract.pdf' };
    }
  };

  eventManager.registerHandlers(handlers);
} 