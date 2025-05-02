import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';

export function registerDocumentHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.DATA.DOCUMENTS.LIST]: async (event, filters) => {
      logger.info('Listado de documentos solicitado', { filters });
      // TODO: Implementar lógica de listado de documentos
      return [];
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.UPLOAD]: async (event, file) => {
      logger.info('Subida de documento solicitada', { fileName: file.name });
      // TODO: Implementar lógica de subida de documento
      return { id: 'new-document-id' };
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.DELETE]: async (event, id) => {
      logger.info('Eliminación de documento solicitada', { id });
      // TODO: Implementar lógica de eliminación de documento
      return true;
    },

    [IPC_CHANNELS.DATA.DOCUMENTS.DOWNLOAD]: async (event, id) => {
      logger.info('Descarga de documento solicitada', { id });
      // TODO: Implementar lógica de descarga de documento
      return { path: 'downloaded-document.pdf' };
    }
  };

  eventManager.registerHandlers(handlers);
} 