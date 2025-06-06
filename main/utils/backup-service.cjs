const fs = require("fs");
const path = require("path");

const DB_PATH = path.resolve(__dirname, "../../prisma/db/pacta.db");
const BACKUP_DIR = path.resolve(__dirname, "../../data/backups");
const BACKUP_PREFIX = "backup_";
const BACKUP_EXT = ".sqlite";
const BACKUP_RETENTION_DAYS = 7;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

class BackupService {
  static instance = null;
  intervalId = null;

  constructor() {
    this.ensureBackupDir();
  }

  static getInstance() {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Inicia el backup automático diario
   */
  scheduleDailyBackup() {
    this.runBackup();
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.runBackup(), ONE_DAY_MS);
    console.info("Backup automático programado cada 24 horas.");
  }

  /**
   * Ejecuta el backup manualmente
   */
  runBackup() {
    try {
      this.ensureBackupDir();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = path.join(
        BACKUP_DIR,
        `${BACKUP_PREFIX}${timestamp}${BACKUP_EXT}`
      );
      fs.copyFileSync(DB_PATH, backupFile);
      console.info(`Backup creado: ${backupFile}`);
      this.cleanupOldBackups();
    } catch (error) {
      console.error("Error al crear backup:", error);
    }
  }

  /**
   * Elimina backups con más de 7 días de antigüedad
   */
  cleanupOldBackups() {
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
            console.info(`Backup eliminado por antigüedad: ${file}`);
          }
        }
      }
      if (deleted > 0) {
        console.info(`Total de backups eliminados: ${deleted}`);
      }
    } catch (error) {
      console.error("Error al limpiar backups antiguos:", error);
    }
  }

  /**
   * Asegura que el directorio de backups existe
   */
  ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  /**
   * Restaura la base de datos desde un archivo de backup
   */
  restoreBackup(backupFile) {
    try {
      const backupPath = path.isAbsolute(backupFile)
        ? backupFile
        : path.join(BACKUP_DIR, backupFile);
      if (!fs.existsSync(backupPath)) {
        throw new Error(`El archivo de backup no existe: ${backupPath}`);
      }
      fs.copyFileSync(backupPath, DB_PATH);
      console.info(`Base de datos restaurada desde backup: ${backupPath}`);
    } catch (error) {
      console.error("Error al restaurar backup:", error);
      throw error;
    }
  }
}

exports.BackupService = BackupService;
exports.backupService = BackupService.getInstance();
