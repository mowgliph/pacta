import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as cron from "node-cron";
import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import { logger } from "./logger";

/**
 * Clase para gestionar copias de seguridad de la base de datos
 * Sigue el patrón Singleton para asegurar una única instancia en la aplicación
 */
export class BackupManager {
  private static instance: BackupManager;
  private backupDir: string;
  private scheduledTask: cron.ScheduledTask | null = null;

  private constructor() {
    this.backupDir = path.join(app.getPath("userData"), "backups");
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
        logger.error("Could not set permissions on backup directory:", error);
      }
    }
  }

  /**
   * Configura un backup automático según la expresión cron proporcionada
   * @param cronExpression Expresión cron para programar la tarea (por defecto diariamente a medianoche)
   */
  public setupScheduledBackup(cronExpression = "0 0 * * *"): void {
    // Cancela cualquier tarea programada anterior
    if (this.scheduledTask) {
      this.scheduledTask.stop();
    }

    // Programa la nueva tarea (por defecto, diariamente a las 00:00)
    this.scheduledTask = cron.schedule(cronExpression, async () => {
      try {
        const systemUserId = await this.getSystemUserId();
        await this.createBackup(systemUserId, "Backup automático programado");
        await this.cleanOldBackups();
      } catch (error) {
        logger.error("Error in scheduled backup:", error);
      }
    });

    logger.info(`Backup programado configurado: ${cronExpression}`);
  }

  /**
   * Obtiene o crea un usuario de sistema para los backups automáticos
   */
  public async getSystemUserId(): Promise<string> {
    // Buscar o crear un usuario de sistema para los backups automáticos
    let systemUser = await prisma.user.findFirst({
      where: {
        email: "system@pacta.local",
      },
    });

    if (!systemUser) {
      // Buscar un rol de administrador
      const adminRole = await prisma.role.findFirst({
        where: {
          name: "Admin",
        },
      });

      if (!adminRole) {
        throw new Error(
          "No se encontró un rol de administrador para el usuario del sistema"
        );
      }

      systemUser = await prisma.user.create({
        data: {
          name: "Sistema",
          email: "system@pacta.local",
          password: "no-login-" + randomBytes(16).toString("hex"),
          roleId: adminRole.id,
          isActive: true,
        },
      });

      logger.info("Usuario de sistema creado para backups automáticos");
    }

    return systemUser.id;
  }

  /**
   * Crea una nueva copia de seguridad de la base de datos
   * @param userId ID del usuario que crea el backup
   * @param note Nota opcional sobre el backup
   * @returns El objeto backup creado
   */
  public async createBackup(userId: string, note?: string): Promise<any> {
    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup-${timestamp}.sqlite`;
    const filePath = path.join(this.backupDir, fileName);

    // Obtener la ruta de la base de datos actual
    const dbPath = path.join(app.getPath("userData"), "database.sqlite");

    // Verificar que la DB existe
    if (!fs.existsSync(dbPath)) {
      throw new Error("Base de datos no encontrada");
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
        note: note || "Backup manual",
        isAutomatic: note?.includes("automático") || false,
      },
    });

    logger.info(`Backup creado: ${fileName}`);
    return backup;
  }

  /**
   * Restaura una copia de seguridad
   * @param backupId ID del backup a restaurar
   * @param userId ID del usuario que realiza la restauración
   * @returns true si la restauración fue exitosa
   */
  public async restoreBackup(
    backupId: string,
    userId: string
  ): Promise<boolean> {
    // Buscar el backup en la base de datos
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error("Backup no encontrado");
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(backup.filePath)) {
      throw new Error("Archivo de backup no encontrado");
    }

    // Obtener la ruta de la base de datos actual
    const dbPath = path.join(app.getPath("userData"), "database.sqlite");

    // Crear una copia de seguridad antes de restaurar
    const preRestoreBackupPath = path.join(
      this.backupDir,
      `pre-restore-${Date.now()}.sqlite`
    );
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
        isAutomatic: true,
      },
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

  /**
   * Elimina una copia de seguridad
   * @param backupId ID del backup a eliminar
   * @returns true si la eliminación fue exitosa
   */
  public async deleteBackup(backupId: string): Promise<boolean> {
    // Buscar el backup en la base de datos
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error("Backup no encontrado");
    }

    // Prevenir eliminación de backups automáticos recientes (menos de 3 días)
    if (
      backup.isAutomatic &&
      new Date().getTime() - new Date(backup.createdAt).getTime() <
        3 * 24 * 60 * 60 * 1000
    ) {
      throw new Error("No se pueden eliminar backups automáticos recientes");
    }

    // Eliminar el archivo con protección de path traversal
    const safePath = path
      .normalize(backup.filePath)
      .replace(/^(\.\.[\/\\])+/, "");

    if (safePath !== backup.filePath) {
      throw new Error("Ruta de backup inválida");
    }

    if (fs.existsSync(safePath)) {
      fs.unlinkSync(safePath);
    }

    // Eliminar el registro en la base de datos
    await prisma.backup.delete({
      where: { id: backupId },
    });

    logger.info(`Backup eliminado: ${backup.fileName}`);
    return true;
  }

  /**
   * Elimina backups antiguos, conservando solo los últimos 7 días
   * para los backups automáticos, o según la configuración del sistema
   */
  public async cleanOldBackups(): Promise<number> {
    let deletedCount = 0;
    try {
      // Buscar backups antiguos (más de 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Buscar backups automáticos antiguos
      const oldAutomaticBackups = await prisma.backup.findMany({
        where: {
          isAutomatic: true,
          createdAt: {
            lt: sevenDaysAgo,
          },
        },
      });

      // Eliminar los backups automáticos antiguos
      for (const backup of oldAutomaticBackups) {
        try {
          await this.deleteBackup(backup.id);
          deletedCount++;
        } catch (error) {
          logger.error(
            `Error al eliminar backup antiguo ${backup.fileName}:`,
            error
          );
        }
      }

      logger.info(
        `Limpieza de backups completada: ${deletedCount} backups eliminados`
      );
      return deletedCount;
    } catch (error) {
      logger.error("Error en limpieza de backups antiguos:", error);
      throw new Error(`Error al limpiar backups antiguos: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los backups ordenados por fecha de creación
   * @returns Lista de backups
   */
  public async getBackups(): Promise<any[]> {
    try {
      const backups = await prisma.backup.findMany({
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Añadir información adicional útil para la UI
      return backups.map((backup) => ({
        ...backup,
        fileSize: this.formatFileSize(backup.fileSize),
        formattedDate: new Date(backup.createdAt).toLocaleString(),
        canDelete:
          !backup.isAutomatic ||
          new Date().getTime() - new Date(backup.createdAt).getTime() >=
            3 * 24 * 60 * 60 * 1000,
      }));
    } catch (error) {
      logger.error("Error al obtener backups:", error);
      throw new Error(`Error al obtener la lista de backups: ${error.message}`);
    }
  }

  /**
   * Verifica si existe un backup específico
   * @param id ID del backup a verificar
   * @returns boolean que indica si existe
   */
  public async backupExists(id: string): Promise<boolean> {
    const backup = await prisma.backup.findUnique({
      where: { id },
    });
    return !!backup;
  }

  /**
   * Formatea el tamaño de archivo a una representación legible
   * @param bytes Tamaño en bytes
   * @returns Texto formateado (ej: "1.5 MB")
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }
}
