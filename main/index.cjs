const { app, nativeTheme, ipcMain } = require("electron");
const { AppManager } = require("./app-manager.cjs");
const { logger } = require("./utils/logger.cjs");
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
    // Prevenir múltiples instancias de la aplicación
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      logger.info(
        "Otra instancia ya está en ejecución. Cerrando esta instancia."
      );
      app.quit();
      return;
    }

    // Configurar el manejo de segundas instancias
    app.on("second-instance", (_event, commandLine, _workingDirectory) => {
      logger.info("Se detectó un intento de abrir una segunda instancia", {
        commandLine,
      });

      // Obtener la instancia del AppManager
      const appManager = AppManager.getInstance();

      // Si hay ventanas existentes, restaurar y enfocar la principal
      appManager.focusMainWindow();

      // Procesar argumentos de línea de comandos si es necesario
      if (commandLine.length > 1) {
        appManager.processCommandLineArgs(commandLine);
      }
    });

    // Evitar navegación a URLs externas (protección contra redirecciones)
    app.on("web-contents-created", (_event, contents) => {
      contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        // Solo permitir navegación dentro de la aplicación
        // (file:// o http://localhost)
        if (
          parsedUrl.protocol !== "file:" &&
          !(
            parsedUrl.protocol === "http:" && parsedUrl.hostname === "localhost"
          )
        ) {
          logger.warn("Navegación bloqueada a URL externa:", navigationUrl);
          event.preventDefault();
        }
      });

      // Prevenir la creación de nuevas ventanas desde el renderer
      contents.setWindowOpenHandler(({ url }) => {
        logger.warn("Intento de abrir nueva ventana bloqueado:", url);
        return { action: "deny" };
      });
    });

    // Crear y obtener la instancia del gestor de la aplicación
    const appManager = AppManager.getInstance();

    // Inicializar el gestor de eventos
    const eventManager = EventManager.getInstance();

    // Inicializar conexión a la base de datos
    const dbOk = await initPrisma();
    if (!dbOk) {
      logger.error("No se pudo conectar a la base de datos. Abortando.");
      app.quit();
      return;
    }

    // Registrar manejadores de eventos
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

    // Instancia correctamente tipada de electron-store
    const themeStore = new ElectronStore({
      name: "theme-preference",
    });

    // Al iniciar la app, aplicar el tema guardado si existe
    const savedTheme = themeStore.get("theme");
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      nativeTheme.themeSource = savedTheme;
    }

    // Handlers para tema claro/oscuro/sistema
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

    // Inicializar la aplicación
    await appManager.initialize();

    // Integrar autoUpdater: notificar al renderer cuando haya una actualización
    autoUpdater.on("update-available", () => {
      appManager.notifyUpdateAvailable();
    });
    // Comprobar actualizaciones automáticamente al iniciar la app
    autoUpdater.checkForUpdatesAndNotify();
  } catch (error) {
    logger.error("Error crítico al iniciar la aplicación:", error);
    process.exit(1);
  }
}

// Configurar manejo global de excepciones no capturadas
process.on("uncaughtException", (error) => {
  logger.error("Error crítico no capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Promesa rechazada no manejada:", reason);
});

// Iniciar la aplicación
main().catch((error) => {
  logger.error("Error no capturado en el punto de entrada:", error);
  app.exit(1);
});
