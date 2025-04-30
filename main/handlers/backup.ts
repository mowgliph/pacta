import { ipcMain } from "electron";
import { BackupService } from "../services/backup.service";
import { logger } from "../lib/logger";
import { BackupChannels } from "../channels/backup.channels";
import { BackupRequests } from "../channels/backup.channels";

const backupService = BackupService.getInstance();

/**
 * Configura los manejadores IPC para las operaciones de backup
 */
export function setupBackupHandlers() {
  // Obtener todos los backups
  ipcMain.handle(
    BackupChannels.GET_ALL,
    async (event): Promise<BackupRequests["GET_ALL"]["response"]> => {
      try {
        const backups = await backupService.getBackups();
        return { success: true, data: backups };
      } catch (error) {
        logger.error("Error al obtener backups:", error);
        return {
          success: false,
          error: "Error al obtener la lista de backups",
        };
      }
    }
  );

  // Crear un nuevo backup
  ipcMain.handle(
    BackupChannels.CREATE,
    async (
      event,
      request: BackupRequests["CREATE"]["request"]
    ): Promise<BackupRequests["CREATE"]["response"]> => {
      try {
        const backup = await backupService.createBackup(
          request.description,
          request.userId
        );
        return { success: true, data: backup };
      } catch (error) {
        logger.error("Error al crear backup:", error);
        return {
          success: false,
          error: "Error al crear el backup",
        };
      }
    }
  );

  // Restaurar un backup
  ipcMain.handle(
    BackupChannels.RESTORE,
    async (
      event,
      request: BackupRequests["RESTORE"]["request"]
    ): Promise<BackupRequests["RESTORE"]["response"]> => {
      try {
        const success = await backupService.restoreBackup(
          request.backupId,
          request.userId
        );
        return { success: true, data: success };
      } catch (error) {
        logger.error("Error al restaurar backup:", error);
        return {
          success: false,
          error: "Error al restaurar el backup",
        };
      }
    }
  );

  // Eliminar un backup
  ipcMain.handle(
    BackupChannels.DELETE,
    async (
      event,
      request: BackupRequests["DELETE"]["request"]
    ): Promise<BackupRequests["DELETE"]["response"]> => {
      try {
        const success = await backupService.deleteBackup(request.backupId);
        return { success: true, data: success };
      } catch (error) {
        logger.error("Error al eliminar backup:", error);
        return {
          success: false,
          error: "Error al eliminar el backup",
        };
      }
    }
  );

  // Limpiar backups antiguos
  ipcMain.handle(
    BackupChannels.CLEAN_OLD,
    async (event): Promise<BackupRequests["CLEAN_OLD"]["response"]> => {
      try {
        const deletedCount = await backupService.cleanOldBackups();
        return { success: true, data: deletedCount };
      } catch (error) {
        logger.error("Error al limpiar backups antiguos:", error);
        return {
          success: false,
          error: "Error al limpiar los backups antiguos",
        };
      }
    }
  );
}
