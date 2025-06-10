const { app } = require("electron");
const { AppManager } = require("./app-manager.cjs");
const { EventManager } = require("./events/event-manager.cjs");
const { initPrisma } = require("./utils/prisma.cjs");
const { autoUpdater } = require("electron-updater");

/**
 * Punto de entrada principal de la aplicación Electron
 * Utiliza el patrón de arquitectura modular con el AppManager
 */
async function main() {
  try {
    // Prevenir multiples instancias de la aplicacion
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      console.info(
        "Otra instancia ya esta en ejecucion. Cerrando esta instancia."
      );
      app.quit();
      return;
    }

    // Configurar el manejo de segundas instancias
    app.on("second-instance", (_event, commandLine, _workingDirectory) => {
      console.info("Se detecto un intento de abrir una segunda instancia", {
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
          console.warn("Navegacion bloqueada a URL externa:", navigationUrl);
          event.preventDefault();
        }
      });
      contents.setWindowOpenHandler(({ url }) => {
        console.warn("Intento de abrir nueva ventana bloqueado:", url);
        return { action: "deny" };
      });
    });

    const dbOk = await initPrisma();
    if (!dbOk) {
      console.error("No se pudo conectar a la base de datos. Abortando.");
      app.quit();
      return;
    }

    const eventManager = new EventManager();
    const appManager = new AppManager(eventManager);

    // Inicializar la aplicacion (los manejadores se registrarán durante la inicialización)
    await appManager.initialize();

    autoUpdater.on("update-available", () => {
      appManager.notifyUpdateAvailable();
    });
    autoUpdater.checkForUpdatesAndNotify();
  } catch (error) {
    console.error(
      "Error critico al iniciar la aplicacion:",
      error,
      error && error.stack
    );
    process.exit(1);
  }
}

// Configurar manejo global de excepciones no capturadas
process.on("uncaughtException", (error) => {
  console.error("Error critico no capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Promesa rechazada no manejada:", reason);
});

// Iniciar la aplicacion
main().catch((error) => {
  console.error("Error no capturado en el punto de entrada:", error);
  app.exit(1);
});
