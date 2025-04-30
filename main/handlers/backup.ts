import { withErrorHandling } from "../middleware/error.middleware";
import { logger } from "../lib/logger";
import { z } from "zod";
import { BackupManager } from "../lib/backup-manager";
import {
  BackupChannels,
  CreateBackupRequest,
  RestoreBackupRequest,
  DeleteBackupRequest,
} from "../channels/backup.channels";

// Esquemas de validación
const createBackupSchema = z.object({
  description: z.string().max(200).optional(),
});

const restoreBackupSchema = z.object({
  backupId: z.string().uuid(),
});

const deleteBackupSchema = z.object({
  backupId: z.string().uuid(),
});

export function setupBackupHandlers(): void {
  // Inicializar el BackupManager y programar backups automáticos
  const backupManager = BackupManager.getInstance();
  backupManager.setupScheduledBackup();

  // Obtener lista de backups
  withErrorHandling(BackupChannels.GET_ALL, async () => {
    try {
      const backups = await backupManager.getBackups();
      return backups;
    } catch (error) {
      logger.error("Error obteniendo backups:", error);
      throw error;
    }
  });

  // Crear backup
  withErrorHandling(
    BackupChannels.CREATE,
    async (_, data: CreateBackupRequest) => {
      try {
        // Validar datos
        const { description } = createBackupSchema.parse(data);

        // Obtener el ID del usuario desde el token
        const userId = data.userId || (await backupManager.getSystemUserId());

        // Crear backup
        const backup = await backupManager.createBackup(userId, description);
        logger.info(`Backup creado por usuario ${userId}: ${backup.fileName}`);

        return backup;
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.warn("Error de validación en backup:create:", error.errors);
          throw new Error("Datos de entrada inválidos");
        }
        throw error;
      }
    }
  );

  // Restaurar backup
  withErrorHandling(
    BackupChannels.RESTORE,
    async (_, data: RestoreBackupRequest) => {
      try {
        // Validar datos
        const { backupId } = restoreBackupSchema.parse(data);

        // Obtener el ID del usuario desde el token
        const userId = data.userId || (await backupManager.getSystemUserId());

        // Restaurar backup
        await backupManager.restoreBackup(backupId, userId);
        logger.info(`Backup ${backupId} restaurado por usuario ${userId}`);

        return { success: true, message: "Backup restaurado con éxito" };
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.warn("Error de validación en backup:restore:", error.errors);
          throw new Error("Datos de entrada inválidos");
        }
        throw error;
      }
    }
  );

  // Eliminar backup
  withErrorHandling(
    BackupChannels.DELETE,
    async (_, data: DeleteBackupRequest) => {
      try {
        // Validar datos
        const { backupId } = deleteBackupSchema.parse(data);

        // Eliminar backup
        await backupManager.deleteBackup(backupId);
        logger.info(`Backup ${backupId} eliminado`);

        return { success: true, message: "Backup eliminado con éxito" };
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.warn("Error de validación en backup:delete:", error.errors);
          throw new Error("Datos de entrada inválidos");
        }
        throw error;
      }
    }
  );

  // Limpiar backups antiguos manualmente
  withErrorHandling(BackupChannels.CLEAN_OLD, async () => {
    const deletedCount = await backupManager.cleanOldBackups();
    return {
      success: true,
      message: `Se eliminaron ${deletedCount} backups antiguos`,
    };
  });

  logger.info("Manejadores de backup inicializados correctamente");
}
