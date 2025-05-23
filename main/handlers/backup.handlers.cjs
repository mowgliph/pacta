const { app } = require("electron");
const { IPC_CHANNELS } = require("../channels/ipc-channels.cjs");
const { EventManager } = require("../events/event-manager.cjs");
const fs = require("fs").promises;
const path = require("path");

const BACKUP_DIR = path.join(app.getPath("userData"), "../data/backups");
const MAX_BACKUP_AGE_DAYS = 30;

function registerBackupHandlers() {
  const eventManager = EventManager.getInstance();

  // Asegurar que existe el directorio de backups
  fs.mkdir(BACKUP_DIR, { recursive: true }).catch(console.error);

  const handlers = {
    [IPC_CHANNELS.BACKUPS.CREATE]: async (event, description) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}.sqlite`);

      // Copiar la base de datos actual
      const dbPath = path.join(app.getPath("userData"), "../data/db.sqlite");
      await fs.copyFile(dbPath, backupPath);

      return {
        backupPath,
        timestamp,
        description,
      };
    },

    [IPC_CHANNELS.BACKUPS.RESTORE]: async (event, backupPath) => {
      if (!backupPath || !(await fs.stat(backupPath)).isFile()) {
        throw new Error("Backup no encontrado");
      }

      const dbPath = path.join(app.getPath("userData"), "../data/db.sqlite");

      // Crear backup antes de restaurar
      const tempBackup = path.join(
        BACKUP_DIR,
        `pre_restore_${Date.now()}.sqlite`
      );
      await fs.copyFile(dbPath, tempBackup);

      try {
        // Restaurar el backup
        await fs.copyFile(backupPath, dbPath);
        return true;
      } catch (restoreError) {
        // Si falla la restauración, intentar recuperar el backup temporal
        await fs.copyFile(tempBackup, dbPath);
        throw new Error(`Error al restaurar: ${restoreError.message}`);
      } finally {
        // Limpiar el backup temporal
        await fs.unlink(tempBackup).catch(console.error);
      }
    },

    [IPC_CHANNELS.BACKUPS.DELETE]: async (event, backupPath) => {
      if (!backupPath || !(await fs.stat(backupPath)).isFile()) {
        throw new Error("Backup no encontrado");
      }

      await fs.unlink(backupPath);
      return true;
    },

    [IPC_CHANNELS.BACKUPS.LIST]: async () => {
      const files = await fs.readdir(BACKUP_DIR);
      const backups = await Promise.all(
        files
          .filter((file) => file.endsWith(".sqlite"))
          .map(async (file) => {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = await fs.stat(filePath);
            return {
              path: filePath,
              name: file,
              timestamp: stats.birthtime,
              size: stats.size,
            };
          })
      );

      return backups.sort((a, b) => b.timestamp - a.timestamp);
    },

    [IPC_CHANNELS.BACKUPS.CLEAN_OLD]: async () => {
      const files = await fs.readdir(BACKUP_DIR);
      const now = new Date();
      const maxAge = MAX_BACKUP_AGE_DAYS * 24 * 60 * 60 * 1000; // días a milisegundos

      const oldBackups = await Promise.all(
        files
          .filter((file) => file.endsWith(".sqlite"))
          .map(async (file) => {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = await fs.stat(filePath);
            return {
              path: filePath,
              age: now - stats.birthtime,
            };
          })
      );

      // Eliminar backups más antiguos que MAX_BACKUP_AGE_DAYS
      await Promise.all(
        oldBackups
          .filter((backup) => backup.age > maxAge)
          .map((backup) => fs.unlink(backup.path))
      );

      return true;
    },
  };

  // Registrar los manejadores con el eventManager
  eventManager.registerHandlers(handlers);
}

module.exports = {
  registerBackupHandlers,
};
