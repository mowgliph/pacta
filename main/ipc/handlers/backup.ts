import { ipcMain, app } from 'electron';
import { IPC_CHANNELS } from '../../utils/constants';
import { prisma } from '../../lib/prisma';
import { withErrorHandling } from '../setup';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { z } from 'zod';
import { BackupManager } from '../../lib/backup-manager';
import { IpcErrorHandler } from '../error-handler';

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(app.getPath('userData'), 'backups');

// Asegurar que el directorio de backups existe
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
  withErrorHandling('backup:getAll', async () => {
    try {
      const backups = await backupManager.getBackups();
      return { backups };
    } catch (error) {
      logger.error('Error obteniendo backups:', error);
      throw error;
    }
  });

  // Crear backup
  withErrorHandling('backup:create', async (_, data) => {
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
        throw IpcErrorHandler.createError(
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
        throw IpcErrorHandler.createError('ValidationError', 'Datos de entrada inválidos');
      }
      throw error;
    }
  });

  // Restaurar backup
  withErrorHandling('backup:restore', async (_, data) => {
    try {
      // Validar datos
      const { backupId, userId } = restoreBackupSchema.parse(data);
      
      // Restaurar backup
      await backupManager.restoreBackup(backupId, userId);
      logger.info(`Backup ${backupId} restaurado por usuario ${userId}`);
      
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Error de validación en backup:restore:', error.errors);
        throw IpcErrorHandler.createError('ValidationError', 'Datos de entrada inválidos');
      }
      throw error;
    }
  });

  // Eliminar backup
  withErrorHandling('backup:delete', async (_, data) => {
    try {
      // Validar datos
      const { backupId } = deleteBackupSchema.parse(data);
      
      // Eliminar backup
      await backupManager.deleteBackup(backupId);
      logger.info(`Backup ${backupId} eliminado`);
      
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Error de validación en backup:delete:', error.errors);
        throw IpcErrorHandler.createError('ValidationError', 'Datos de entrada inválidos');
      }
      throw error;
    }
  });

  // Limpiar backups antiguos manualmente
  withErrorHandling('backup:cleanOld', async () => {
    await backupManager.cleanOldBackups();
    return { success: true, message: 'Limpieza de backups antiguos completada' };
  });
} 