import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { logger } from './logger';
import cron from 'node-cron';

export class BackupManager {
  private static instance: BackupManager;
  private backupDir: string;
  private scheduledTask: cron.ScheduledTask | null = null;

  private constructor() {
    this.backupDir = path.join(app.getPath('userData'), 'backups');
    this.ensureBackupDirectory();
  }

  public static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true, mode: 0o700 });
    } else {
      // Verificar y corregir permisos
      try {
        fs.chmodSync(this.backupDir, 0o700);
      } catch (error) {
        logger.error('Could not set permissions on backup directory:', error);
      }
    }
  }

  public setupScheduledBackup(cronExpression = '0 0 * * *'): void {
    // Cancela cualquier tarea programada anterior
    if (this.scheduledTask) {
      this.scheduledTask.stop();
    }

    // Programa la nueva tarea (por defecto, diariamente a las 00:00)
    this.scheduledTask = cron.schedule(cronExpression, async () => {
      try {
        const systemUserId = await this.getSystemUserId();
        await this.createBackup(systemUserId, 'Backup automático programado');
        await this.cleanOldBackups();
      } catch (error) {
        logger.error('Error in scheduled backup:', error);
      }
    });

    logger.info(`Backup programado configurado: ${cronExpression}`);
  }

  private async getSystemUserId(): Promise<string> {
    // Buscar o crear un usuario de sistema para los backups automáticos
    let systemUser = await prisma.user.findFirst({
      where: {
        email: 'system@pacta.local'
      }
    });

    if (!systemUser) {
      // Buscar un rol de administrador
      const adminRole = await prisma.role.findFirst({
        where: {
          name: 'Admin'
        }
      });

      if (!adminRole) {
        throw new Error('No se encontró un rol de administrador para el usuario del sistema');
      }

      systemUser = await prisma.user.create({
        data: {
          name: 'Sistema',
          email: 'system@pacta.local',
          password: 'no-login-' + Math.random().toString(36).substring(2),
          roleId: adminRole.id,
          isActive: true
        }
      });

      logger.info('Usuario de sistema creado para backups automáticos');
    }

    return systemUser.id;
  }

  public async createBackup(userId: string, note?: string): Promise<any> {
    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.sqlite`;
    const filePath = path.join(this.backupDir, fileName);

    // Obtener la ruta de la base de datos actual
    const dbPath = path.join(app.getPath('userData'), 'database.sqlite');

    // Verificar que la DB existe
    if (!fs.existsSync(dbPath)) {
      throw new Error('Base de datos no encontrada');
    }

    // Copiar la base de datos actual
    fs.copyFileSync(dbPath, filePath);

    // Establecer permisos adecuados (solo propietario puede leer/escribir)
    fs.chmodSync(filePath, 0o600);

    // Obtener el tamaño del archivo
    const fileSize = fs.statSync(filePath).size;

    // Registrar el backup en la base de datos
    const backup = await prisma.backup.create({
      data: {
        fileName,
        filePath,
        fileSize,
        createdById: userId,
        note: note || 'Backup manual',
        isAutomatic: note?.includes('automático') || false
      }
    });

    logger.info(`Backup creado: ${fileName}`);
    return backup;
  }

  public async restoreBackup(backupId: string, userId: string): Promise<boolean> {
    // Buscar el backup en la base de datos
    const backup = await prisma.backup.findUnique({
      where: { id: backupId }
    });

    if (!backup) {
      throw new Error('Backup no encontrado');
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(backup.filePath)) {
      throw new Error('Archivo de backup no encontrado');
    }

    // Obtener la ruta de la base de datos actual
    const dbPath = path.join(app.getPath('userData'), 'database.sqlite');

    // Crear una copia de seguridad antes de restaurar
    const preRestoreBackupPath = path.join(this.backupDir, `pre-restore-${Date.now()}.sqlite`);
    fs.copyFileSync(dbPath, preRestoreBackupPath);
    
    // Establecer permisos adecuados
    fs.chmodSync(preRestoreBackupPath, 0o600);

    // Registrar el backup de seguridad en la base de datos
    await prisma.backup.create({
      data: {
        fileName: path.basename(preRestoreBackupPath),
        filePath: preRestoreBackupPath,
        fileSize: fs.statSync(preRestoreBackupPath).size,
        createdById: userId,
        note: `Backup automático pre-restauración`,
        isAutomatic: true
      }
    });

    // Desconectar Prisma antes de restaurar
    await prisma.$disconnect();

    // Restaurar el backup
    fs.copyFileSync(backup.filePath, dbPath);
    
    // Establecer permisos adecuados
    fs.chmodSync(dbPath, 0o600);

    logger.info(`Backup restaurado: ${backup.fileName}`);
    return true;
  }

  public async deleteBackup(backupId: string): Promise<boolean> {
    // Buscar el backup en la base de datos
    const backup = await prisma.backup.findUnique({
      where: { id: backupId }
    });

    if (!backup) {
      throw new Error('Backup no encontrado');
    }

    // Prevenir eliminación de backups automáticos recientes (menos de 3 días)
    if (backup.isAutomatic && 
        (new Date().getTime() - new Date(backup.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000)) {
      throw new Error('No se pueden eliminar backups automáticos recientes');
    }

    // Eliminar el archivo con protección de path traversal
    const safePath = path.normalize(backup.filePath).replace(/^(\.\.[\/\\])+/, '');
    
    if (safePath !== backup.filePath) {
      throw new Error('Ruta de backup inválida');
    }
    
    if (fs.existsSync(safePath)) {
      fs.unlinkSync(safePath);
    }

    // Eliminar el registro en la base de datos
    await prisma.backup.delete({
      where: { id: backupId }
    });

    logger.info(`Backup eliminado: ${backup.fileName}`);
    return true;
  }

  public async getBackups(): Promise<any[]> {
    return await prisma.backup.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  public async cleanOldBackups(): Promise<void> {
    try {
      // Eliminar backups manuales más antiguos que 30 días
      const oldManualBackups = await prisma.backup.findMany({
        where: {
          isAutomatic: false,
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      // Eliminar backups automáticos más antiguos que 7 días
      const oldAutoBackups = await prisma.backup.findMany({
        where: {
          isAutomatic: true,
          createdAt: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const oldBackups = [...oldManualBackups, ...oldAutoBackups];

      for (const backup of oldBackups) {
        // Eliminar archivo
        if (fs.existsSync(backup.filePath)) {
          fs.unlinkSync(backup.filePath);
        }

        // Eliminar registro
        await prisma.backup.delete({
          where: { id: backup.id }
        });

        logger.info(`Backup antiguo eliminado: ${backup.fileName}`);
      }
    } catch (error) {
      logger.error('Error cleaning old backups:', error);
    }
  }
} 