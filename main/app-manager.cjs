const { app, dialog } = require("electron");
const windowManagerModule = require("./window/window-manager.cjs");
console.log("[DEBUG] windowManagerModule:", windowManagerModule);
const WindowManager = windowManagerModule.WindowManager;
const { securityManager } = require("./security/security-manager.cjs");
const { ErrorHandler } = require("./utils/error-handler.cjs");
const { backupService } = require("./utils/backup-service.cjs");

// Clase para gestionar el ciclo de vida de la aplicación Electron
// Implementa el patrón Singleton para garantizar una única instancia
function AppManager(eventManager) {
  if (!(this instanceof AppManager)) return new AppManager(eventManager);
  this.windowManager = WindowManager.getInstance();
  this.securityManager = securityManager;
  this.eventManager = eventManager;
  this.errorHandler = null;
  this.mainWindow = null;

  // Configurar opciones y eventos de la aplicación
  this.setupAppOptions();
  this.setupAppEvents();
}

AppManager._instance = null;

AppManager.getInstance = function (eventManager) {
  if (!AppManager._instance) {
    AppManager._instance = new AppManager(eventManager);
  }
  return AppManager._instance;
};

AppManager.prototype.initialize = async function () {
  try {
    console.info("Iniciando aplicación PACTA...");
    if (!app.isReady()) {
      await this.waitForAppReady();
    }
    
    // Configurar seguridad
    this.securityManager.setupSecurity();
    
    // Crear ventana principal
    this.mainWindow = await this.windowManager.createMainWindow();
    
    // Configurar manejadores de eventos
    if (this.eventManager) {
      const { setupIpcHandlers } = require('./handlers');
      setupIpcHandlers(this.mainWindow, this.eventManager);
    }
    
    // Configurar manejadores de errores y respaldo automático
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

  // Eliminar los dos primeros argumentos (electron y script path)
  const actualArgs = args.slice(2);

  for (let i = 0; i < actualArgs.length; i++) {
    const arg = actualArgs[i];

    try {
      switch (arg) {
        case "--backup": {
          // Crear backup manual
          console.info("Iniciando backup manual...");
          backupService.runBackup();
          break;
        }

        case "--cleanup-backups": {
          // Limpiar backups antiguos
          console.info("Limpiando backups antiguos...");
          backupService.cleanupOldBackups();
          break;
        }

        case "--restore": {
          // Restaurar desde backup
          const backupFile = actualArgs[i + 1];
          if (!backupFile) {
            throw new Error("Se requiere especificar el archivo de backup");
          }
          console.info("Restaurando desde backup:", backupFile);
          backupService.restoreBackup(backupFile);
          i++; // Saltar el siguiente argumento
          break;
        }

        case "--export-contracts": {
          // Exportar contratos
          const exportPath = actualArgs[i + 1];
          if (!exportPath) {
            throw new Error("Se requiere especificar la ruta de exportación");
          }
          console.info("Exportando contratos a:", exportPath);
          this.windowManager
            .getMainWindow()
            ?.webContents.send("contracts:export", exportPath);
          i++;
          break;
        }

        case "--check-updates": {
          // Verificar actualizaciones manualmente
          console.info("Verificando actualizaciones...");
          this.windowManager
            .getMainWindow()
            ?.webContents.send("app:check-updates");
          break;
        }

        case "--reset-settings": {
          // Resetear configuración
          console.info("Reseteando configuración de la aplicación...");
          this.windowManager
            .getMainWindow()
            ?.webContents.send("app:reset-settings");
          break;
        }

        case "--debug": {
          // Activar modo debug
          console.info("Modo debug activado");
          process.env.DEBUG = "true";
          break;
        }

        case "--help": {
          console.info(`
PACTA - Plataforma de Gestión de Contratos Empresariales

Argumentos disponibles:
  --backup              Realizar backup manual de la base de datos
  --cleanup-backups     Eliminar backups antiguos (>7 días)
  --restore <archivo>   Restaurar desde archivo de backup específico
  --export-contracts <ruta>  Exportar contratos a la ruta especificada
  --check-updates      Verificar actualizaciones manualmente
  --reset-settings     Resetear configuración a valores por defecto
  --debug             Activar modo debug
  --help              Mostrar esta ayuda

Ejemplos:
  electron . --backup
  electron . --restore data/backups/backup_2025-05-19.sqlite
  electron . --export-contracts ./contratos.xlsx
          `);
          break;
        }

        default: {
          if (arg.startsWith("--")) {
            console.warn("Argumento no reconocido:", arg);
          }
          break;
        }
      }
    } catch (error) {
      console.error(`Error procesando argumento ${arg}:`, error.message);
      dialog.showErrorBox(
        "Error en argumento de línea de comandos",
        `Error procesando ${arg}: ${error.message}`
      );
    }
  }
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
