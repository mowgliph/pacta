const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { backupService } = require("../utils/backup-service.cjs");
const { shell, app } = require("electron");
const { config } = require("../utils/config.cjs");
const fs = require("fs");
const path = require("path");
const { withErrorHandling, AppError } = require("../utils/error-handler.cjs");

const CONFIG_PATH = path.join(app.getPath("userData"), "config.json");

function isValidKey(key) {
  return (
    key !== "__proto__" &&
    key !== "constructor" &&
    key !== "prototype" &&
    typeof key === "string" &&
    key.length > 0
  );
}

function getConfigValue(key) {
  if (typeof key !== "string") return undefined;

  const keys = key.split(".");
  if (!keys.every(isValidKey)) return undefined;

  return keys.reduce((obj, k) => {
    if (
      obj &&
      typeof obj === "object" &&
      Object.prototype.hasOwnProperty.call(obj, k)
    ) {
      return obj[k];
    }
    return undefined;
  }, config);
}

function setConfigValue(key, value) {
  if (typeof key !== "string") return false;

  const keys = key.split(".");
  if (!keys.every(isValidKey)) return false;

  let obj = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];

    // Solo crear nuevo objeto si la propiedad no existe
    if (!Object.prototype.hasOwnProperty.call(obj, k)) {
      Object.defineProperty(obj, k, {
        value: {},
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else if (typeof obj[k] !== "object" || obj[k] === null) {
      // Si existe pero no es un objeto, no permitir la operación
      return false;
    }

    obj = obj[k];
  }

  const lastKey = keys[keys.length - 1];
  Object.defineProperty(obj, lastKey, {
    value: value,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  return true;
}

function persistConfig() {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), {
      encoding: "utf-8",
    });
    console.info("Configuración persistida en disco");
  } catch (error) {
    console.error("[ERROR] Error al persistir configuración:", error);
  }
}

function registerSystemHandlers(eventManager) {
  const handlers = {
    [IPC_CHANNELS.SYSTEM.OPEN_FILE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.OPEN_FILE,
      async (event, filePath) => {
        try {
          if (!filePath) {
            throw AppError.validation(
              "Ruta de archivo requerida",
              "FILE_PATH_REQUIRED"
            );
          }

          const result = await shell.openPath(filePath);
          if (result) {
            throw AppError.internal(
              "Error al abrir archivo",
              "FILE_OPEN_ERROR",
              { error: result }
            );
          }

          console.info("Archivo abierto exitosamente", { filePath });
          return { success: true, data: true };
        } catch (error) {
          console.error("Error al abrir archivo:", error);
          throw AppError.internal(
            "Error al abrir archivo",
            "FILE_OPEN_ERROR",
            { error: error.message }
          );
        }
      }
    ),
    [IPC_CHANNELS.SYSTEM.SAVE_FILE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.SAVE_FILE,
      async (event, filePath, content) => {
        try {
          if (!filePath) {
            throw AppError.validation(
              "Ruta de archivo requerida",
              "FILE_PATH_REQUIRED"
            );
          }
          if (content === undefined) {
            throw AppError.validation(
              "Contenido requerido",
              "FILE_CONTENT_REQUIRED"
            );
          }

          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, content);

          console.info("Archivo guardado exitosamente", { filePath });
          return { success: true, data: true };
        } catch (error) {
          console.error("Error al guardar archivo:", error);
          throw AppError.internal(
            "Error al guardar archivo",
            "FILE_SAVE_ERROR",
            { error: error.message }
          );
        }
      }
    ),
    [IPC_CHANNELS.SYSTEM.BACKUP]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.BACKUP,
      async () => {
        try {
          backupService.runBackup();
          const files = fs.readdirSync(
            path.resolve(__dirname, "../../data/backups")
          );
          const backups = files.filter(
            (f) => f.startsWith("backup_") && f.endsWith(".sqlite")
          );
          const lastBackup = backups.sort().reverse()[0];

          if (!lastBackup) {
            throw AppError.notFound(
              "No se encontró ningún backup",
              "BACKUP_NOT_FOUND"
            );
          }

          console.info("Backup realizado exitosamente", { backupPath: lastBackup });
          return { success: true, data: { path: lastBackup } };
        } catch (error) {
          console.error("Error al realizar backup:", error);
          throw AppError.internal(
            "Error al realizar backup",
            "BACKUP_ERROR",
            { error: error.message }
          );
        }
      }
    ),
    [IPC_CHANNELS.SYSTEM.RESTORE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.RESTORE,
      async (event, backupId) => {
        try {
          if (!backupId) {
            throw AppError.validation(
              "ID de backup requerido",
              "BACKUP_ID_REQUIRED"
            );
          }

          backupService.restoreBackup(backupId);
          console.info("Backup restaurado exitosamente", { backupId });
          return { success: true, data: true };
        } catch (error) {
          console.error("Error al restaurar backup:", error);
          throw AppError.internal(
            "Error al restaurar backup",
            "BACKUP_RESTORE_ERROR",
            { error: error.message }
          );
        }
      }
    ),
    [IPC_CHANNELS.SYSTEM.SETTINGS.GET]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.SETTINGS.GET,
      async (event, key) => {
        try {
          if (!key) {
            throw AppError.validation(
              "Clave de configuración requerida",
              "CONFIG_KEY_REQUIRED"
            );
          }

          const value = getConfigValue(key);
          if (value === undefined) {
            throw AppError.notFound(
              "Clave de configuración no encontrada",
              "CONFIG_KEY_NOT_FOUND"
            );
          }

          console.info("Configuración obtenida exitosamente", { key });
          return { success: true, data: value };
        } catch (error) {
          console.error("Error al obtener configuración:", error);
          throw AppError.internal(
            "Error al obtener configuración",
            "CONFIG_GET_ERROR",
            { error: error.message }
          );
        }
      }
    ),
    [IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE,
      async (event, key, value) => {
        try {
          if (!key) {
            throw AppError.validation(
              "Clave de configuración requerida",
              "CONFIG_KEY_REQUIRED"
            );
          }

          const success = setConfigValue(key, value);
          if (!success) {
            throw AppError.validation(
              "Clave de configuración inválida o no permitida",
              "INVALID_CONFIG_KEY"
            );
          }

          persistConfig();
          console.info("Configuración actualizada exitosamente", { key });
          return { success: true, data: true };
        } catch (error) {
          console.error("Error al actualizar configuración:", error);
          throw AppError.internal(
            "Error al actualizar configuración",
            "CONFIG_UPDATE_ERROR",
            { error: error.message }
          );
        }
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

module.exports = { registerSystemHandlers };
