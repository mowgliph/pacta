const { app, dialog } = require("electron");
const windowManagerModule = require("./window/window-manager.cjs");
console.log("[DEBUG] windowManagerModule:", windowManagerModule);
const WindowManager = windowManagerModule.WindowManager;
const { securityManager } = require("./security/security-manager.cjs");
const { ErrorHandler } = require("./utils/error-handler.cjs");
const { backupService } = require("./utils/backup-service.cjs");

// Clase para gestionar el ciclo de vida de la aplicación Electron
// Implementa el patrón Singleton para garantizar una única instancia
function AppManager() {
  if (!(this instanceof AppManager)) return new AppManager();
  this.windowManager = WindowManager.getInstance();
  this.securityManager = securityManager;
  this.errorHandler = null;
  this.mainWindow = null;

  // Configurar opciones y eventos de la aplicación
  this.setupAppOptions();
  this.setupAppEvents();
}

AppManager._instance = null;

AppManager.getInstance = function () {
  if (!AppManager._instance) {
    AppManager._instance = new AppManager();
  }
  return AppManager._instance;
};

AppManager.prototype.initialize = async function () {
  try {
    console.info("Iniciando aplicación PACTA...");
    if (!app.isReady()) {
      await this.waitForAppReady();
    }
    this.securityManager.setupSecurity();
    this.mainWindow = await this.windowManager.createMainWindow();
    this.setupErrorHandler();
    this.setupAutoBackup();
    console.info("Aplicación PACTA inicializada correctamente");
  } catch (error) {
    console.error(
      "Error al inicializar la aplicación:",
      error,
      error && error.stack
    );
    dialog.showErrorBox(
      "Error de inicialización",
      `Ha ocurrido un error al iniciar la aplicación.\n${
        error && error.message ? error.message : String(error)
      }`
    );
    app.exit(1);
  }
};

AppManager.prototype.setupAppOptions = function () {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }
  app.on("second-instance", () => {
    const mainWindow = this.windowManager.getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.setAppUserModelId("com.pacta.app");
};

AppManager.prototype.setupAppEvents = function () {
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  app.on("activate", async () => {
    if (this.windowManager.getWindowCount() === 0) {
      this.mainWindow = await this.windowManager.createMainWindow();
    }
  });
  app.on("before-quit", () => {
    console.info("Cerrando aplicación PACTA...");
  });
};

AppManager.prototype.waitForAppReady = function () {
  return new Promise((resolve) => {
    if (app.isReady()) {
      resolve();
    } else {
      app.once("ready", () => {
        resolve();
      });
    }
  });
};

AppManager.prototype.restartApp = function () {
  app.relaunch();
  app.exit(0);
};

AppManager.prototype.exitApp = function () {
  app.exit(0);
};

AppManager.prototype.getMainWindow = function () {
  return this.windowManager.getMainWindow();
};

AppManager.prototype.focusMainWindow = function () {
  const mainWindow = this.windowManager.getMainWindow();
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
};

AppManager.prototype.processCommandLineArgs = function (args) {
  if (!Array.isArray(args) || args.length <= 1) {
    return;
  }
  console.info("Procesando argumentos de línea de comandos:", args);
  // Implementar la lógica específica para procesar argumentos
};

AppManager.prototype.setupErrorHandler = function () {
  process.on("uncaughtException", (error) => {
    ErrorHandler.handle(error);
    dialog.showErrorBox(
      "Error inesperado",
      "Ha ocurrido un error inesperado. La aplicación se reiniciará."
    );
    app.relaunch();
    app.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    ErrorHandler.handle(reason);
    dialog.showErrorBox(
      "Error de promesa no manejada",
      "Se detectó un error no manejado. La aplicación se reiniciará."
    );
    app.relaunch();
    app.exit(1);
  });
};

AppManager.prototype.setupAutoBackup = function () {
  backupService.scheduleDailyBackup();
};

AppManager.prototype.notifyUpdateAvailable = function () {
  const mainWindow = this.getMainWindow();
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send("app:update-available");
  }
};

exports.AppManager = AppManager;
