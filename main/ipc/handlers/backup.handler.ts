import { ipcMain } from "electron";
import { BackupManager } from "../../lib/backup-manager";
import { logger } from "../../lib/logger";

/**
 * Configura los manejadores IPC para las operaciones de respaldo
 */
export function setupBackupHandlers() {
  // Obtener instancia del BackupManager
  const backupManager = BackupManager.getInstance();

  // Obtener lista de respaldos
  ipcMain.handle("backups:getAll", async () => {
    try {
      const backups = await backupManager.getBackups();
      return { success: true, backups };
    } catch (error) {
      logger.error("Error getting backups:", error);
      return { success: false, error: error.message };
    }
  });

  // Crear respaldo manual
  ipcMain.handle("backups:create", async (_, userId: string, note?: string) => {
    try {
      const backup = await backupManager.createBackup(
        userId,
        note || "Backup manual"
      );
      return { success: true, backup };
    } catch (error) {
      logger.error("Error creating backup:", error);
      return { success: false, error: error.message };
    }
  });

  // Restaurar respaldo
  ipcMain.handle(
    "backups:restore",
    async (_, backupId: string, userId: string) => {
      try {
        await backupManager.restoreBackup(backupId, userId);
        return { success: true };
      } catch (error) {
        logger.error("Error restoring backup:", error);
        return { success: false, error: error.message };
      }
    }
  );

  // Eliminar respaldo
  ipcMain.handle("backups:delete", async (_, backupId: string) => {
    try {
      await backupManager.deleteBackup(backupId);
      return { success: true };
    } catch (error) {
      logger.error("Error deleting backup:", error);
      return { success: false, error: error.message };
    }
  });

  // Limpiar backups antiguos manualmente
  ipcMain.handle("backups:cleanOld", async () => {
    try {
      await backupManager.cleanOldBackups();
      return { success: true };
    } catch (error) {
      logger.error("Error cleaning old backups:", error);
      return { success: false, error: error.message };
    }
  });

  // Cambiar programación de backups automáticos
  ipcMain.handle(
    "backups:updateSchedule",
    async (_, cronExpression: string) => {
      try {
        backupManager.setupScheduledBackup(cronExpression);
        return { success: true };
      } catch (error) {
        logger.error("Error updating backup schedule:", error);
        return { success: false, error: error.message };
      }
    }
  );

  logger.info("Backup handlers initialized");
}
