import { EventManager } from "../events/event-manager";
import { IPC_CHANNELS } from "../channels/ipc-channels";
import { IpcHandlerMap } from "../channels/types";
import { logger } from "../utils/logger";
import * as store from "../store/store-manager";
import { withErrorHandling } from "../utils/error-handler";

export function registerStoreHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.STORE.GET]: withErrorHandling(
      IPC_CHANNELS.STORE.GET,
      async (event: Electron.IpcMainInvokeEvent, key: string) => {
        logger.info("Obteniendo valor del store:", key);
        let value = null;
        switch (key) {
          case "theme":
            value = store.getTheme();
            break;
          case "notificationsEnabled":
            value = store.getNotificationsEnabled();
            break;
          case "notificationDays":
            value = store.getNotificationDays();
            break;
          case "authToken":
            value = store.getAuthToken();
            break;
          case "authUserId":
            value = store.getAuthUserId();
            break;
        }
        return { success: true, data: value };
      }
    ),
    [IPC_CHANNELS.STORE.SET]: withErrorHandling(
      IPC_CHANNELS.STORE.SET,
      async (event: Electron.IpcMainInvokeEvent, { key, value }: any) => {
        logger.info("Guardando valor en store:", { key, value });
        switch (key) {
          case "theme":
            store.setTheme(value);
            break;
          case "notificationsEnabled":
            store.setNotificationsEnabled(value);
            break;
          case "notificationDays":
            store.setNotificationDays(value);
            break;
          case "authToken":
            store.setAuthToken(value);
            break;
        }
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.STORE.DELETE]: withErrorHandling(
      IPC_CHANNELS.STORE.DELETE,
      async (event: Electron.IpcMainInvokeEvent, key: string) => {
        logger.info("Eliminando valor del store:", key);
        if (key === "auth") {
          store.clearAuth();
        }
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.STORE.CLEAR]: withErrorHandling(
      IPC_CHANNELS.STORE.CLEAR,
      async () => {
        logger.info("Limpiando store");
        store.clearStore();
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.STORE.BACKUP]: withErrorHandling(
      IPC_CHANNELS.STORE.BACKUP,
      async () => {
        logger.info("Backup no implementado");
        return { success: true, data: false };
      }
    ),
    [IPC_CHANNELS.STORE.RESTORE]: withErrorHandling(
      IPC_CHANNELS.STORE.RESTORE,
      async (event: Electron.IpcMainInvokeEvent, backupPath: string) => {
        logger.info("Restore no implementado");
        return { success: true, data: false };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}
