const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const store = require("../store/store-manager.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { AppError } = require("../utils/error-handler.cjs");

const VALID_KEYS = [
  "theme",
  "notificationsEnabled",
  "notificationDays",
  "authToken",
  "authUserId",
];

function registerStoreHandlers() {
  const eventManager = EventManager.getInstance();

  const handlers = {
    [IPC_CHANNELS.STORE.GET]: async (event, key) => {
      if (!key) {
        throw AppError.validation(
          "Key requerida para obtener valor",
          "KEY_REQUIRED"
        );
      }

      if (!VALID_KEYS.includes(key)) {
        throw AppError.validation(`Key inválida: ${key}`, "INVALID_KEY", {
          validKeys: VALID_KEYS,
        });
      }

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

      if (value === null || value === undefined) {
        throw AppError.notFound(
          `No se encontró valor para la key: ${key}`,
          "VALUE_NOT_FOUND"
        );
      }

      return value;
    },

    [IPC_CHANNELS.STORE.SET]: async (event, { key, value }) => {
      if (!key || value === undefined) {
        throw AppError.validation(
          "Key y value requeridos para almacenar",
          "KEY_VALUE_REQUIRED"
        );
      }

      if (!VALID_KEYS.includes(key)) {
        throw AppError.validation(`Key inválida: ${key}`, "INVALID_KEY", {
          validKeys: VALID_KEYS,
        });
      }

      console.info("Guardando valor en store:", { key, value });

      try {
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
          default:
            throw AppError.validation(
              `Key no soportada para escritura: ${key}`,
              "UNSUPPORTED_KEY_WRITE"
            );
        }
        return true;
      } catch (error) {
        throw AppError.internal(
          "Error al guardar en el store",
          "STORE_SAVE_ERROR",
          { key, error: error.message }
        );
      }
    },
  };

  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerStoreHandlers,
};
