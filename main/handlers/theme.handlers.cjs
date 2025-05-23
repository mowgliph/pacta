const { nativeTheme } = require("electron");
const Store = require("electron-store");
const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const { AppError } = require("../utils/error-handler.cjs");

const themeStore = new Store({
  name: "theme-preference",
});

const THEME_KEY = "theme";
const VALID_THEMES = ["light", "dark", "system"];

function registerThemeHandlers() {
  const eventManager = EventManager.getInstance();

  const handlers = {
    [IPC_CHANNELS.THEME.GET_SYSTEM]: async () => {
      try {
        return nativeTheme.shouldUseDarkColors ? "dark" : "light";
      } catch (error) {
        console.error("Error al obtener tema del sistema:", error);
        throw AppError.internal(
          "Error al obtener tema del sistema",
          "THEME_SYSTEM_ERROR"
        );
      }
    },

    [IPC_CHANNELS.THEME.GET_SAVED]: async () => {
      try {
        return themeStore.get(THEME_KEY) || "system";
      } catch (error) {
        console.error("Error al obtener tema guardado:", error);
        throw AppError.internal(
          "Error al obtener tema guardado",
          "THEME_STORE_ERROR"
        );
      }
    },

    [IPC_CHANNELS.THEME.SET_APP]: async (event, theme) => {
      if (!theme) {
        throw AppError.validation("Tema requerido", "THEME_REQUIRED");
      }

      if (!VALID_THEMES.includes(theme)) {
        throw AppError.validation("Tema no válido", "INVALID_THEME", {
          validThemes: VALID_THEMES,
        });
      }

      try {
        nativeTheme.themeSource = theme;
        themeStore.set(THEME_KEY, theme);
        return { theme };
      } catch (error) {
        console.error("Error al establecer tema:", error);
        throw AppError.internal("Error al establecer tema", "THEME_SET_ERROR");
      }
    },
  };

  // Registrar los manejadores
  eventManager.registerHandlers(handlers);

  // Escuchar cambios en el tema del sistema
  nativeTheme.on("updated", () => {
    try {
      const mainWindow = eventManager.getMainWindow();
      if (mainWindow) {
        const currentTheme = themeStore.get(THEME_KEY);
        if (currentTheme === "system") {
          const systemTheme = nativeTheme.shouldUseDarkColors
            ? "dark"
            : "light";
          mainWindow.webContents.send(
            IPC_CHANNELS.THEME.SYSTEM_CHANGED,
            systemTheme
          );
          console.log(`Tema del sistema actualizado a: ${systemTheme}`);
        }
      }
    } catch (error) {
      console.error("Error al manejar cambio de tema:", error);
    }
  });

  // Inicializar el tema
  const initialize = () => {
    try {
      const savedTheme = themeStore.get(THEME_KEY) || "system";
      if (!VALID_THEMES.includes(savedTheme)) {
        console.warn("Tema guardado no válido, usando 'system'");
        nativeTheme.themeSource = "system";
        return "system";
      }
      nativeTheme.themeSource = savedTheme;
      console.log(`Tema inicializado: ${savedTheme}`);
      return savedTheme;
    } catch (error) {
      console.error("Error al inicializar tema:", error);
      return "system";
    }
  };

  return { initialize };
}

module.exports = {
  registerThemeHandlers,
};
