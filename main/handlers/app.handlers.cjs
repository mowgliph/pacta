const { app } = require("electron");
const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { AppError } = require("../utils/error-handler.cjs");

function registerAppHandlers() {
  const eventManager = EventManager.getInstance();

  const handlers = {
    [IPC_CHANNELS.APP.RESTART]: async () => {
      try {
        console.log("Reiniciando aplicación...");
        app.relaunch();
        app.exit(0);
        return true;
      } catch (error) {
        console.error("Error al reiniciar la aplicación:", error);
        throw AppError.internal(
          "Error al reiniciar la aplicación",
          "APP_RESTART_ERROR"
        );
      }
    },

    [IPC_CHANNELS.APP.GET_VERSION]: async () => {
      try {
        return app.getVersion();
      } catch (error) {
        console.error("Error al obtener versión:", error);
        throw AppError.internal(
          "Error al obtener versión",
          "APP_VERSION_ERROR"
        );
      }
    },

    [IPC_CHANNELS.APP.GET_PATH]: async (event, name) => {
      if (!name) {
        throw AppError.validation(
          "Nombre de ruta requerido",
          "PATH_NAME_REQUIRED"
        );
      }

      try {
        return app.getPath(name);
      } catch (error) {
        console.error(`Error al obtener ruta ${name}:`, error);
        throw AppError.internal("Error al obtener ruta", "APP_PATH_ERROR", {
          pathName: name,
        });
      }
    },

    [IPC_CHANNELS.APP.GET_INFO]: async () => {
      try {
        const info = {
          version: app.getVersion(),
          name: app.getName(),
          isPackaged: app.isPackaged,
          locale: app.getLocale(),
          paths: {
            userData: app.getPath("userData"),
            temp: app.getPath("temp"),
            logs: app.getPath("logs"),
          },
        };
        console.log("Información de la aplicación recuperada:", info);
        return info;
      } catch (error) {
        console.error("Error al obtener información de la app:", error);
        throw AppError.internal(
          "Error al obtener información de la aplicación",
          "APP_INFO_ERROR"
        );
      }
    },
  };

  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerAppHandlers,
};
