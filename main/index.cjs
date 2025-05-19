const { app, nativeTheme, ipcMain } = require("electron");
const { AppManager } = require("./app-manager.cjs");
const { EventManager } = require("./events/event-manager.cjs");
const { registerAuthHandlers } = require("./handlers/auth.handlers.cjs");
const {
  registerContractHandlers,
} = require("./handlers/contract.handlers.cjs");
const {
  registerDocumentHandlers,
} = require("./handlers/document.handlers.cjs");
const { registerUserHandlers } = require("./handlers/user.handlers.cjs");
const { registerSystemHandlers } = require("./handlers/system.handlers.cjs");
const {
  registerNotificationHandlers,
} = require("./handlers/notification.handlers.cjs");
const { registerRoleHandlers } = require("./handlers/role.handlers.cjs");
const {
  registerSupplementHandlers,
} = require("./handlers/supplement.handlers.cjs");
const {
  registerStatisticsHandlers,
} = require("./handlers/statistics.handlers.cjs");
const {
  registerSecurityHandlers,
} = require("./handlers/security.handlers.cjs");
const { registerStoreHandlers } = require("./handlers/store.handlers.cjs");
const {
  registerValidationHandlers,
} = require("./handlers/validation.handlers.cjs");
const { initPrisma } = require("./utils/prisma.cjs");
const ElectronStore = require("electron-store");
const { autoUpdater } = require("electron-updater");

/**
 * Punto de entrada principal de la aplicación Electron
 * Utiliza el patrón de arquitectura modular con el AppManager
 */
async function main() {
  try {
    console.info("[DEBUG] Inicio de main()");
    // Prevenir múltiples instancias de la aplicación
    const gotTheLock = app.requestSingleInstanceLock();
    console.info("[DEBUG] requestSingleInstanceLock:", gotTheLock);

    if (!gotTheLock) {
      console.info(
        "Otra instancia ya está en ejecución. Cerrando esta instancia."
      );
      app.quit();
      return;
    }

    // Configurar el manejo de segundas instancias
    app.on("second-instance", (_event, commandLine, _workingDirectory) => {
      console.info("Se detectó un intento de abrir una segunda instancia", {
        commandLine,
      });
      const appManager = AppManager.getInstance();
      appManager.focusMainWindow();
      if (commandLine.length > 1) {
        appManager.processCommandLineArgs(commandLine);
      }
    });

    app.on("web-contents-created", (_event, contents) => {
      contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (
          parsedUrl.protocol !== "file:" &&
          !(
            parsedUrl.protocol === "http:" && parsedUrl.hostname === "localhost"
          )
        ) {
          console.warn("Navegación bloqueada a URL externa:", navigationUrl);
          event.preventDefault();
        }
      });
      contents.setWindowOpenHandler(({ url }) => {
        console.warn("Intento de abrir nueva ventana bloqueado:", url);
        return { action: "deny" };
      });
    });

    console.info("[DEBUG] Antes de AppManager.getInstance()");
    const appManager = AppManager.getInstance();
    console.info("[DEBUG] Después de AppManager.getInstance()");

    console.info("[DEBUG] Antes de EventManager.getInstance()");
    const eventManager = EventManager.getInstance();
    console.info("[DEBUG] Después de EventManager.getInstance()");

    console.info("[DEBUG] Antes de initPrisma()");
    const dbOk = await initPrisma();
    console.info("[DEBUG] Después de initPrisma():", dbOk);
    if (!dbOk) {
      console.error("No se pudo conectar a la base de datos. Abortando.");
      app.quit();
      return;
    }

    console.info("[DEBUG] Antes de registrar manejadores de eventos");
    registerAuthHandlers(eventManager);
    registerContractHandlers(eventManager);
    registerDocumentHandlers(eventManager);
    registerUserHandlers(eventManager);
    registerSystemHandlers(eventManager);
    registerNotificationHandlers(eventManager);
    registerRoleHandlers(eventManager);
    registerSupplementHandlers(eventManager);
    registerStatisticsHandlers(eventManager);
    registerSecurityHandlers(eventManager);
    registerStoreHandlers(eventManager);
    registerValidationHandlers(eventManager);
    console.info("[DEBUG] Después de registrar manejadores de eventos");

    console.info("[DEBUG] Antes de instanciar ElectronStore");
    console.log("ElectronStore:", ElectronStore);
    const themeStore = new ElectronStore({
      name: "theme-preference",
    });
    console.info("[DEBUG] Después de instanciar ElectronStore");

    const savedTheme = themeStore.get("theme");
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      nativeTheme.themeSource = savedTheme;
    }

    ipcMain.handle("theme:get-system", () => {
      return nativeTheme.shouldUseDarkColors ? "dark" : "light";
    });
    ipcMain.handle("theme:set-app", (event, theme) => {
      if (["light", "dark", "system"].includes(theme)) {
        nativeTheme.themeSource = theme;
        themeStore.set("theme", theme);
        return { success: true };
      }
      return { success: false, error: "Tema no válido" };
    });

    console.info("[DEBUG] Antes de appManager.initialize()");
    await appManager.initialize();
    console.info("[DEBUG] Después de appManager.initialize()");

    autoUpdater.on("update-available", () => {
      appManager.notifyUpdateAvailable();
    });
    autoUpdater.checkForUpdatesAndNotify();
  } catch (error) {
    console.error(
      "Error crítico al iniciar la aplicación:",
      error,
      error && error.stack
    );
    process.exit(1);
  }
}

// Configurar manejo global de excepciones no capturadas
process.on("uncaughtException", (error) => {
  console.error("Error crítico no capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Promesa rechazada no manejada:", reason);
});

// Iniciar la aplicación
main().catch((error) => {
  console.error("Error no capturado en el punto de entrada:", error);
  app.exit(1);
});
