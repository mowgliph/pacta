const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { backupService } = require("../utils/backup-service.cjs");
const { shell, app } = require("electron");
const { config } = require("../utils/config.cjs");
const fs = require("fs");
const path = require("path");
const { withErrorHandling } = require("../utils/error-handler.cjs");

const CONFIG_PATH = path.join(app.getPath("userData"), "config.json");

function getConfigValue(key) {
  return key.split(".").reduce((obj, k) => {
    if (obj && typeof obj === "object" && k in obj) {
      return obj[k];
    }
    return undefined;
  }, config);
}

function setConfigValue(key, value) {
  const keys = key.split(".");
  let obj = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
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
        setConfigValue(key, value);
        persistConfig();
        return { success: true, data: true };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}

module.exports = { registerSystemHandlers };
