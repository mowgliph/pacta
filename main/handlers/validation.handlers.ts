import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { ValidationService } from '../validations';

export function registerValidationHandlers(eventManager: EventManager): void {
  const validationService = ValidationService.getInstance();

  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.VALIDATION.VALIDATE]: async (event, { type, data }) => {
      logger.info('Validando datos:', { type, data });
      switch (type) {
        case 'contract':
          return validationService.validateContract(data);
        case 'user':
          return validationService.validateUser(data);
        case 'supplement':
          return validationService.validateSupplement(data);
        case 'document':
          return validationService.validateDocument(data);
        case 'notification':
          return validationService.validateNotification(data);
        case 'notificationFilter':
          return validationService.validateNotificationFilter(data);
        case 'createBackup':
          return validationService.validateCreateBackup(data);
        case 'restoreBackup':
          return validationService.validateRestoreBackup(data);
        case 'deleteBackup':
          return validationService.validateDeleteBackup(data);
        case 'openFile':
          return validationService.validateOpenFile(data);
        case 'confirmDialog':
          return validationService.validateConfirmDialog(data);
        case 'performance':
          return validationService.validatePerformance(data);
        default:
          throw new Error(`Tipo de validación no soportado: ${type}`);
      }
    },

    [IPC_CHANNELS.VALIDATION.SCHEMA.GET]: async (event, schemaName: string) => {
      logger.info('Obteniendo esquema no implementado:', schemaName);
      return null;
    },

    [IPC_CHANNELS.VALIDATION.SCHEMA.LIST]: async () => {
      logger.info('Listando esquemas no implementado');
      return [];
    }
  };

  eventManager.registerHandlers(handlers);
} 