import { EventManager } from "../events/event-manager";
import { IPC_CHANNELS } from "../channels/ipc-channels";
import { IpcHandlerMap } from "../channels/types";
import { logger } from "../utils/logger";
import { backupService } from "../utils/backup-service";
import { shell } from "electron";
import { config } from "../utils/config";
import fs from "fs";
import path from "path";
import { withErrorHandling } from "../utils/error-handler";

const CONFIG_PATH = path.join(
  require("electron").app.getPath("userData"),
  "config.json"
);

function getConfigValue(key: string): any {
  return key.split(".").reduce((obj, k) => {
    if (obj && typeof obj === "object" && k in obj) {
      // @ts-expect-error: acceso dinámico controlado
      return obj[k];
    }
    return undefined;
  }, config);
}

function setConfigValue(key: string, value: any): void {
  const keys = key.split(".");
  let obj: any = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
}

function persistConfig(): void {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), {
      encoding: "utf-8",
    });
    logger.info("Configuración persistida en disco");
  } catch (error) {
    logger.error("Error al persistir configuración:", error);
  }
}

export function registerSystemHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.SYSTEM.OPEN_FILE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.OPEN_FILE,
      async (event: Electron.IpcMainInvokeEvent, filePath: string) => {
        const result = await shell.openPath(filePath);
        if (result) throw new Error(result);
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.SYSTEM.SAVE_FILE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.SAVE_FILE,
      async (
        event: Electron.IpcMainInvokeEvent,
        filePath: string,
        content: any
      ) => {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content);
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.SYSTEM.BACKUP]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.BACKUP,
      async (event: Electron.IpcMainInvokeEvent) => {
        backupService.runBackup();
        const files = require("fs").readdirSync(
          require("path").resolve(__dirname, "../../data/backups")
        );
        const backups = files.filter(
          (f: string) => f.startsWith("backup_") && f.endsWith(".sqlite")
        );
        const lastBackup = backups.sort().reverse()[0];
        return { success: true, data: { path: lastBackup } };
      }
    ),
    [IPC_CHANNELS.SYSTEM.RESTORE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.RESTORE,
      async (event: Electron.IpcMainInvokeEvent, backupId: string) => {
        backupService.restoreBackup(backupId);
        return { success: true, data: true };
      }
    ),
    [IPC_CHANNELS.SYSTEM.SETTINGS.GET]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.SETTINGS.GET,
      async (event: Electron.IpcMainInvokeEvent, key: string) => {
        const value = getConfigValue(key);
        return { success: true, data: value };
      }
    ),
    [IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE]: withErrorHandling(
      IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE,
      async (event: Electron.IpcMainInvokeEvent, key: string, value: any) => {
        setConfigValue(key, value);
        persistConfig();
        return { success: true, data: true };
      }
    ),
  };
  eventManager.registerHandlers(handlers);
}
