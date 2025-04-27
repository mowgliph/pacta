import { ipcMain, app } from 'electron';
import { IpcChannels, CreateBackupRequest, RestoreBackupRequest, DeleteBackupRequest } from '../../shared/types';
import { prisma } from '../../lib/prisma';
import { withErrorHandling } from '../setup';
import { logger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { BackupManager } from '../../lib/backup-manager';
import { ErrorHandler } from '../error-handler';

// Asegurar que el directorio de backups existe
const BACKUP_DIR = path.join(app.getPath('userData'), 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Esquemas de validación
const createBackupSchema = z.object({
  userId: z.string().uuid(),
  note: z.string().max(200).optional()
});

const restoreBackupSchema = z.object({
  backupId: z.string().uuid(),
  userId: z.string().uuid()
});

const deleteBackupSchema = z.object({
  backupId: z.string().uuid()
});

export function setupBackupHandlers(): void {
  // Inicializar el BackupManager y programar backups automáticos
  const backupManager = BackupManager.getInstance();
  backupManager.setupScheduledBackup();

  // Obtener lista de backups
  withErrorHandling(IpcChannels.BACKUPS_GET_ALL, async () => {
    try {
      const backups = await backupManager.getBackups();
      return { backups };
    } catch (error) {
      logger.error('Error obteniendo backups:', error);
      throw error;
    }
  });

  // Crear backup
  withErrorHandling(IpcChannels.BACKUPS_CREATE, async (_, data: CreateBackupRequest) => {
    try {
      // Validar datos
      const { userId, note } = createBackupSchema.parse(data);
      
      // Verificar límite de backups manuales por día
      const backups = await backupManager.getBackups();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const manualBackupsToday = backups.filter(b => 
        !b.isAutomatic && 
        new Date(b.createdAt) >= today && 
        b.createdBy.id === userId
      );
      
      if (manualBackupsToday.length >= 5) {
        throw ErrorHandler.createError(
          'LimitExceeded', 
          'Has alcanzado el límite de 5 backups manuales por día'
        );
      }
      
      // Crear backup
      const backup = await backupManager.createBackup(userId, note);
      logger.info(`Backup creado por usuario ${userId}: ${backup.fileName}`);
      
      return { success: true, backup };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Error de validación en backup:create:', error.errors);
        throw ErrorHandler.createError('ValidationError', 'Datos de entrada inválidos');
      }
      throw error;
    }
  });

  // Restaurar backup
  withErrorHandling(IpcChannels.BACKUPS_RESTORE, async (_, data: RestoreBackupRequest) => {
    try {
      // Validar datos
      const { backupId, userId } = restoreBackupSchema.parse(data);
      
      // Restaurar backup
      await backupManager.restoreBackup(backupId, userId);
      logger.info(`Backup ${backupId} restaurado por usuario ${userId}`);
      
      return { success: true, message: 'Backup restaurado con éxito' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Error de validación en backup:restore:', error.errors);
        throw ErrorHandler.createError('ValidationError', 'Datos de entrada inválidos');
      }
      throw error;
    }
  });

  // Eliminar backup
  withErrorHandling(IpcChannels.BACKUPS_DELETE, async (_, data: DeleteBackupRequest) => {
    try {
      // Validar datos
      const { backupId } = deleteBackupSchema.parse(data);
      
      // Eliminar backup
      await backupManager.deleteBackup(backupId);
      logger.info(`Backup ${backupId} eliminado`);
      
      return { success: true, message: 'Backup eliminado con éxito' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Error de validación en backup:delete:', error.errors);
        throw ErrorHandler.createError('ValidationError', 'Datos de entrada inválidos');
      }
      throw error;
    }
  });

  // Limpiar backups antiguos manualmente
  withErrorHandling(IpcChannels.BACKUPS_CLEAN_OLD, async () => {
    await backupManager.cleanOldBackups();
    return { success: true, message: 'Limpieza de backups antiguos completada' };
  });
} 