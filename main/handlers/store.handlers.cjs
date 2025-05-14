const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const store = require("../store/store-manager.cjs");
const { withErrorHandling } = require("../utils/error-handler.cjs");

function registerStoreHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.STORE.GET]: withErrorHandling(
      IPC_CHANNELS.STORE.GET,
      async (event, key) => {
        console.info("Obteniendo valor del store:", key);
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
      async (event, { key, value }) => {
        console.info("Guardando valor en store:", { key, value });
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
      async (event, key) => {
        console.info("Eliminando valor del store:", key);
        if (key === "auth") {
          store.clearAuth();
        }
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.STORE.CLEAR]: withErrorHandling(
      IPC_CHANNELS.STORE.CLEAR,
      async () => {
        console.info("Limpiando store");
        store.clearStore();
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.STORE.BACKUP]: withErrorHandling(
      IPC_CHANNELS.STORE.BACKUP,
      async () => {
        console.info("Backup no implementado");
        return { success: true, data: false };
      }
    ),
    [IPC_CHANNELS.STORE.RESTORE]: withErrorHandling(
      IPC_CHANNELS.STORE.RESTORE,
      async (event, backupPath) => {
        console.info("Restore no implementado");
        return { success: true, data: false };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

module.exports = { registerStoreHandlers };
