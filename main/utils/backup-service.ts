import fs from 'fs';
import path from 'path';
import { logger } from './logger';

const DB_PATH = path.resolve(__dirname, '../../prisma/db/pacta.db');
const BACKUP_DIR = path.resolve(__dirname, '../../data/backups');
const BACKUP_PREFIX = 'backup_';
const BACKUP_EXT = '.sqlite';
const BACKUP_RETENTION_DAYS = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class BackupService {
  private static instance: BackupService;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    this.ensureBackupDir();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Inicia el backup automático diario
   */
  public scheduleDailyBackup(): void {
    this.runBackup(); // Ejecutar al iniciar
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.runBackup(), ONE_DAY_MS);
    logger.info('Backup automático programado cada 24 horas.');
  }

  /**
   * Ejecuta el backup manualmente
   */
  public runBackup(): void {
    try {
      this.ensureBackupDir();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(BACKUP_DIR, `${BACKUP_PREFIX}${timestamp}${BACKUP_EXT}`);
      fs.copyFileSync(DB_PATH, backupFile);
      logger.info(`Backup creado: ${backupFile}`);
      this.cleanupOldBackups();
    } catch (error) {
      logger.error('Error al crear backup:', error);
    }
  }

  /**
   * Elimina backups con más de 7 días de antigüedad
   */
  private cleanupOldBackups(): void {
    try {
      const files = fs.readdirSync(BACKUP_DIR);
      const now = Date.now();
      let deleted = 0;
      for (const file of files) {
        if (file.startsWith(BACKUP_PREFIX) && file.endsWith(BACKUP_EXT)) {
          const filePath = path.join(BACKUP_DIR, file);
          const stats = fs.statSync(filePath);
          const ageDays = (now - stats.mtimeMs) / ONE_DAY_MS;
          if (ageDays > BACKUP_RETENTION_DAYS) {
            fs.unlinkSync(filePath);
            deleted++;
            logger.info(`Backup eliminado por antigüedad: ${file}`);
          }
        }
      }
      if (deleted > 0) {
        logger.info(`Total de backups eliminados: ${deleted}`);
      }
    } catch (error) {
      logger.error('Error al limpiar backups antiguos:', error);
    }
  }

  /**
   * Asegura que el directorio de backups existe
   */
  private ensureBackupDir(): void {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  /**
   * Restaura la base de datos desde un archivo de backup
   */
  public restoreBackup(backupFile: string): void {
    try {
      const backupPath = path.isAbsolute(backupFile)
        ? backupFile
        : path.join(BACKUP_DIR, backupFile);
      if (!fs.existsSync(backupPath)) {
        throw new Error(`El archivo de backup no existe: ${backupPath}`);
      }
      fs.copyFileSync(backupPath, DB_PATH);
      logger.info(`Base de datos restaurada desde backup: ${backupPath}`);
    } catch (error) {
      logger.error('Error al restaurar backup:', error);
      throw error;
    }
  }
}

// Exportar instancia única
export const backupService = BackupService.getInstance(); 