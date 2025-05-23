const { app, nativeTheme, ipcMain } = require("electron");
const { AppManager } = require("./app-manager.cjs");
const { EventManager } = require("./events/event-manager.cjs");
const { registerAppHandlers } = require("./handlers/app.handlers.cjs");
const { registerBackupHandlers } = require("./handlers/backup.handlers.cjs");
const { registerThemeHandlers } = require("./handlers/theme.handlers.cjs");
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
const { registerLicenseHandlers } = require("./handlers/license.handlers.cjs");
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
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      console.info(
        "Otra instancia ya está en ejecución. Cerrando esta instancia."
      );
      app.quit();
      return;
    }

    const eventManager = new EventManager();
    const appManager = new AppManager(eventManager);

    // Registrar todos los manejadores
    registerThemeHandlers(eventManager);
    registerAppHandlers(eventManager);
    registerBackupHandlers(eventManager);
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
    registerLicenseHandlers(eventManager);

    // Inicializar el tema
    const themeHandler = registerThemeHandlers(eventManager);
    themeHandler.initialize();

    await appManager.initialize();

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
