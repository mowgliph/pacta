import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import * as store from '../store/store-manager';

export function registerStoreHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.STORE.GET]: async (event, key: string) => {
      logger.info('Obteniendo valor del store:', key);
      switch (key) {
        case 'theme':
          return store.getTheme();
        case 'notificationsEnabled':
          return store.getNotificationsEnabled();
        case 'notificationDays':
          return store.getNotificationDays();
        case 'authToken':
          return store.getAuthToken();
        case 'authUserId':
          return store.getAuthUserId();
        default:
          return null;
      }
    },

    [IPC_CHANNELS.STORE.SET]: async (event, { key, value }) => {
      logger.info('Guardando valor en store:', { key, value });
      switch (key) {
        case 'theme':
          store.setTheme(value);
          break;
        case 'notificationsEnabled':
          store.setNotificationsEnabled(value);
          break;
        case 'notificationDays':
          store.setNotificationDays(value);
          break;
        case 'authToken':
          store.setAuthToken(value);
          break;
      }
      return true;
    },

    [IPC_CHANNELS.STORE.DELETE]: async (event, key: string) => {
      logger.info('Eliminando valor del store:', key);
      if (key === 'auth') {
        store.clearAuth();
      }
      return true;
    },

    [IPC_CHANNELS.STORE.CLEAR]: async () => {
      logger.info('Limpiando store');
      store.clearStore();
      return true;
    },

    [IPC_CHANNELS.STORE.BACKUP]: async () => {
      logger.info('Backup no implementado');
      return false;
    },

    [IPC_CHANNELS.STORE.RESTORE]: async (event, backupPath: string) => {
      logger.info('Restore no implementado');
      return false;
    }
  };

  eventManager.registerHandlers(handlers);
} 