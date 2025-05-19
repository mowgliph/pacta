const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { backupService } = require("../utils/backup-service.cjs");
const { shell, app } = require("electron");
const { config } = require("../utils/config.cjs");
const fs = require("fs");
const path = require("path");
const { withErrorHandling } = require("../utils/error-handler.cjs");

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
        const result = await shell.openPath(filePath);
        if (result) throw new Error(result);
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.SYSTEM.SAVE_FILE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.SAVE_FILE,
      async (event, filePath, content) => {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.SYSTEM.BACKUP]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.BACKUP,
      async () => {
        backupService.runBackup();
        const files = fs.readdirSync(
          path.resolve(__dirname, "../../data/backups")
        );
        const backups = files.filter(
          (f) => f.startsWith("backup_") && f.endsWith(".sqlite")
        );
        const lastBackup = backups.sort().reverse()[0];
        return { success: true, data: { path: lastBackup } };
      }
    ),
    [IPC_CHANNELS.SYSTEM.RESTORE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.RESTORE,
      async (event, backupId) => {
        backupService.restoreBackup(backupId);
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.SYSTEM.SETTINGS.GET]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.SETTINGS.GET,
      async (event, key) => {
        const value = getConfigValue(key);
        return { success: true, data: value };
      }
    ),
    [IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE,
      async (event, key, value) => {
        const success = setConfigValue(key, value);
        if (!success) {
          throw new Error("Clave de configuración inválida o no permitida");
        }
        persistConfig();
        return { success: true, data: true };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

module.exports = { registerSystemHandlers };
