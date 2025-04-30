import fs from "fs/promises";
import path from "path";
import { app } from "electron";
import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../lib/logger";
import * as fsSync from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { Backup, BackupRestore } from "../models/backup.model";
import { BackupChannels } from "../channels/backup.channels";
import { ipcMain } from "electron";
import * as archiver from "archiver";
import fsExtra from "fs-extra";

const execAsync = promisify(exec);

/**
 * Servicio para gestionar copias de seguridad
 */
export class BackupService {
  private static instance: BackupService;
  private backupDir: string;
  private maxBackupAge: number = 7; // días
  private backups: Backup[] = [];

  private constructor() {
    this.backupDir = path.join(app.getPath("userData"), "backups");
    this.ensureBackupDirectory();
    this.loadBackups();
    this.setupChannels();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private async ensureBackupDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      logger.error("Error al crear directorio de backups:", error);
      throw new Error("No se pudo crear el directorio de backups");
    }
  }

  private loadBackups() {
    try {
      const files = fsSync.readdirSync(this.backupDir);
      this.backups = files
        .filter((file) => file.endsWith(".zip"))
        .map((file) => {
          const stats = fsSync.statSync(path.join(this.backupDir, file));
          return {
            id: path.basename(file, ".zip"),
            fileName: file,
            filePath: path.join(this.backupDir, file),
            fileSize: stats.size,
            createdAt: stats.birthtime,
            isAutomatic: false,
            emailNotification: false,
            createdById: "system",
            note: null,
            createdBy: {
              id: "system",
              name: "System",
            },
          };
        });
    } catch (error) {
      console.error("Error loading backups:", error);
      this.backups = [];
    }
  }

  private setupChannels() {
    ipcMain.handle(BackupChannels.GET_ALL, () => {
      return this.backups;
    });

    ipcMain.handle(BackupChannels.CREATE, async (_, description?: string) => {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `backup-${timestamp}.zip`;
        const backupPath = path.join(this.backupDir, filename);

        const output = fsSync.createWriteStream(backupPath);
        const archive = archiver("zip", {
          zlib: { level: 9 },
        });

        output.on("close", () => {
          const backup: Backup = {
            id: path.basename(filename, ".zip"),
            fileName: filename,
            filePath: backupPath,
            fileSize: archive.pointer(),
            createdAt: new Date(),
            note: description || null,
            isAutomatic: false,
            createdById: "system",
            createdBy: {
              id: "system",
              name: "System",
            },
            emailNotification: false,
          };
          this.backups.push(backup);
        });

        archive.pipe(output);
        archive.directory(app.getPath("userData"), false);
        await archive.finalize();

        return { success: true };
      } catch (error) {
        console.error("Error creating backup:", error);
        return { success: false, error: "Error creating backup" };
      }
    });

    ipcMain.handle(BackupChannels.RESTORE, async (_, backupId: string) => {
      try {
        const backup = this.backups.find((b) => b.id === backupId);
        if (!backup) {
          return { success: false, error: "Backup not found" };
        }

        // Implementar lógica de restauración aquí
        return { success: true };
      } catch (error) {
        console.error("Error restoring backup:", error);
        return { success: false, error: "Error restoring backup" };
      }
    });

    ipcMain.handle(BackupChannels.DELETE, async (_, backupId: string) => {
      try {
        const backup = this.backups.find((b) => b.id === backupId);
        if (!backup) {
          return { success: false, error: "Backup not found" };
        }

        fsSync.unlinkSync(backup.filePath);
        this.backups = this.backups.filter((b) => b.id !== backupId);
        return { success: true };
      } catch (error) {
        console.error("Error deleting backup:", error);
        return { success: false, error: "Error deleting backup" };
      }
    });

    ipcMain.handle(BackupChannels.CLEAN_OLD, async (_, days: number) => {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const oldBackups = this.backups.filter((b) => b.createdAt < cutoffDate);
        for (const backup of oldBackups) {
          fsSync.unlinkSync(backup.filePath);
        }

        this.backups = this.backups.filter((b) => b.createdAt >= cutoffDate);
        return { success: true, deleted: oldBackups.length };
      } catch (error) {
        console.error("Error cleaning old backups:", error);
        return { success: false, error: "Error cleaning old backups" };
      }
    });
  }

  /**
   * Crea una copia de seguridad de la base de datos y archivos críticos
   * @param description Descripción opcional del respaldo
   * @param userId ID del usuario que crea el backup
   * @returns El objeto de respaldo creado
   */
  public async createBackup(
    description?: string,
    userId?: string
  ): Promise<Backup> {
    try {
      logger.info("Iniciando creación de respaldo");

      const backupId = uuidv4();
      const timestamp = new Date();
      const userDataPath = app.getPath("userData");

      // Crear directorio para el respaldo
      const backupPath = path.join(this.backupDir, backupId);
      await fs.mkdir(backupPath, { recursive: true });

      // Respaldo de la base de datos
      const dbPath = path.join(userDataPath, "database.sqlite");
      const dbBackupPath = path.join(backupPath, "database.sqlite");
      await fs.copyFile(dbPath, dbBackupPath);

      // Respaldo de los documentos
      const docsPath = path.join(userDataPath, "documents");
      const docsBackupPath = path.join(backupPath, "documents");

      if (fsSync.existsSync(docsPath)) {
        await fs.mkdir(docsBackupPath, { recursive: true });

        const files = await fs.readdir(docsPath);
        for (const file of files) {
          const srcPath = path.join(docsPath, file);
          const destPath = path.join(docsBackupPath, file);

          const stat = await fs.stat(srcPath);
          if (stat.isFile()) {
            await fs.copyFile(srcPath, destPath);
          }
        }
      }

      // Crear metadatos del respaldo
      const metadataPath = path.join(backupPath, "metadata.json");
      const metadata = {
        id: backupId,
        createdAt: timestamp,
        description:
          description || `Respaldo automático - ${timestamp.toLocaleString()}`,
        appVersion: app.getVersion(),
        userId: userId || "system",
      };

      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      // Calcular tamaño del respaldo
      const backupSize = await this.calculateDirectorySize(backupPath);

      // Registrar el respaldo en la base de datos
      const backup = await prisma.backup.create({
        data: {
          id: backupId,
          fileName: `Backup-${timestamp.toISOString().slice(0, 10)}`,
          filePath: backupPath,
          fileSize: backupSize,
          note:
            description ||
            `Respaldo automático - ${timestamp.toLocaleString()}`,
          isAutomatic: !description,
          createdById: userId || "system",
          emailNotification: false,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      logger.info(`Respaldo completado: ${backupId}`);
      return backup;
    } catch (error) {
      logger.error("Error al crear respaldo:", error);
      throw new Error(`Error al crear respaldo: ${error.message}`);
    }
  }

  /**
   * Restaura una copia de seguridad existente
   * @param backupId El ID del respaldo a restaurar
   * @param userId ID del usuario que realiza la restauración
   * @returns True si la restauración fue exitosa
   */
  public async restoreBackup(
    backupId: string,
    userId?: string
  ): Promise<boolean> {
    try {
      logger.info(`Iniciando restauración de respaldo: ${backupId}`);

      // Verificar que el respaldo existe
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
      });
      if (!backup) {
        throw new Error(`Respaldo no encontrado: ${backupId}`);
      }

      const backupPath = backup.filePath;
      if (!fsSync.existsSync(backupPath)) {
        throw new Error(`Directorio de respaldo no encontrado: ${backupPath}`);
      }

      const userDataPath = app.getPath("userData");

      // Cerrar la conexión a la base de datos
      await prisma.$disconnect();

      // Restaurar la base de datos
      const dbPath = path.join(userDataPath, "database.sqlite");
      const dbBackupPath = path.join(backupPath, "database.sqlite");

      // Crear respaldo temporal de la base de datos actual
      const tempDbBackup = path.join(
        userDataPath,
        `database_pre_restore_${Date.now()}.sqlite`
      );
      await fs.copyFile(dbPath, tempDbBackup);

      try {
        // Reemplazar la base de datos
        await fs.copyFile(dbBackupPath, dbPath);

        // Restaurar documentos
        const docsPath = path.join(userDataPath, "documents");
        const docsBackupPath = path.join(backupPath, "documents");

        if (fsSync.existsSync(docsBackupPath)) {
          // Respaldar documentos actuales
          const tempDocsBackup = path.join(
            userDataPath,
            `documents_pre_restore_${Date.now()}`
          );
          if (fsSync.existsSync(docsPath)) {
            await fs.rename(docsPath, tempDocsBackup);
          }

          // Crear directorio de documentos
          await fs.mkdir(docsPath, { recursive: true });

          // Copiar documentos respaldados
          const files = await fs.readdir(docsBackupPath);
          for (const file of files) {
            const srcPath = path.join(docsBackupPath, file);
            const destPath = path.join(docsPath, file);

            const stat = await fs.stat(srcPath);
            if (stat.isFile()) {
              await fs.copyFile(srcPath, destPath);
            }
          }
        }

        // Registrar la restauración
        await prisma.backupRestore.create({
          data: {
            backupId: backup.id,
            restoredById: userId || "system",
            restoredAt: new Date(),
          },
        });

        logger.info(`Respaldo restaurado: ${backupId}`);
        return true;
      } catch (error) {
        // En caso de error, restauramos la base de datos original
        logger.error(
          "Error durante la restauración, revirtiendo cambios:",
          error
        );
        await fs.copyFile(tempDbBackup, dbPath);
        throw error;
      } finally {
        // Eliminar respaldo temporal
        try {
          await fs.unlink(tempDbBackup);
        } catch (e) {
          logger.warn("No se pudo eliminar el respaldo temporal de la BD:", e);
        }
      }
    } catch (error) {
      logger.error("Error al restaurar respaldo:", error);
      throw new Error(`Error al restaurar respaldo: ${error.message}`);
    }
  }

  /**
   * Elimina un respaldo existente
   * @param backupId El ID del respaldo a eliminar
   * @returns True si la eliminación fue exitosa
   */
  public async deleteBackup(backupId: string): Promise<boolean> {
    try {
      logger.info(`Eliminando respaldo: ${backupId}`);

      // Verificar que el respaldo existe
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
      });
      if (!backup) {
        throw new Error(`Respaldo no encontrado: ${backupId}`);
      }

      // Eliminar archivos del respaldo
      try {
        await fs.rm(backup.filePath, { recursive: true, force: true });
      } catch (error) {
        logger.warn(
          `No se pudieron eliminar los archivos del respaldo ${backupId}:`,
          error
        );
        // Continuamos para eliminar el registro de la base de datos
      }

      // Eliminar registro de la base de datos
      await prisma.backup.delete({ where: { id: backupId } });

      logger.info(`Respaldo eliminado: ${backupId}`);
      return true;
    } catch (error) {
      logger.error("Error al eliminar respaldo:", error);
      throw new Error(`Error al eliminar respaldo: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los respaldos disponibles
   * @returns Lista de respaldos ordenados por fecha de creación
   */
  public async getBackups(): Promise<Backup[]> {
    try {
      const backups = await prisma.backup.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return backups;
    } catch (error) {
      logger.error("Error al obtener respaldos:", error);
      throw new Error(`Error al obtener respaldos: ${error.message}`);
    }
  }

  /**
   * Limpia los respaldos antiguos
   * @returns Número de respaldos eliminados
   */
  public async cleanOldBackups(): Promise<number> {
    let deletedCount = 0;
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.maxBackupAge);

      const oldBackups = await prisma.backup.findMany({
        where: {
          isAutomatic: true,
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      for (const backup of oldBackups) {
        try {
          await this.deleteBackup(backup.id);
          deletedCount++;
        } catch (error) {
          logger.error(
            `Error al eliminar respaldo antiguo ${backup.id}:`,
            error
          );
        }
      }

      logger.info(
        `Limpieza de respaldos completada: ${deletedCount} respaldos eliminados`
      );
      return deletedCount;
    } catch (error) {
      logger.error("Error en limpieza de respaldos antiguos:", error);
      throw new Error(`Error al limpiar respaldos antiguos: ${error.message}`);
    }
  }

  /**
   * Calcula el tamaño total de un directorio
   * @param dirPath Ruta del directorio
   * @returns Tamaño total en bytes
   */
  private async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        totalSize += stat.size;
      } else if (stat.isDirectory()) {
        totalSize += await this.calculateDirectorySize(filePath);
      }
    }

    return totalSize;
  }
}
