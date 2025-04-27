import fs from "fs/promises";
import path from "path";
import { app } from "electron";
import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../lib/logger";
import * as FileSystem from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Crea una copia de seguridad de la base de datos y archivos críticos
 * @param description Descripción opcional del respaldo
 * @returns El objeto de respaldo creado
 */
export async function createBackup(description?: string): Promise<any> {
  try {
    logger.info("Iniciando creación de respaldo");

    const backupId = uuidv4();
    const timestamp = new Date();
    const userDataPath = app.getPath("userData");

    // Crear directorio para el respaldo
    const backupPath = path.join(userDataPath, "backups", backupId);
    await fs.mkdir(backupPath, { recursive: true });

    // Respaldo de la base de datos
    const dbPath = path.join(userDataPath, "database.sqlite");
    const dbBackupPath = path.join(backupPath, "database.sqlite");
    await fs.copyFile(dbPath, dbBackupPath);

    // Respaldo de los documentos
    const docsPath = path.join(userDataPath, "documents");
    const docsBackupPath = path.join(backupPath, "documents");

    if (FileSystem.existsSync(docsPath)) {
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
    };

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Calcular tamaño del respaldo
    const backupSize = await calculateDirectorySize(backupPath);
    
    // Registrar el respaldo en la base de datos
    const backup = await prisma.backup.create({
      data: {
        id: backupId,
        fileName: `Backup-${timestamp.toISOString().slice(0, 10)}`,
        filePath: backupPath,
        fileSize: backupSize,
        note: description || `Respaldo automático - ${timestamp.toLocaleString()}`,
        isAutomatic: description ? false : true,
        createdById: 'system', // Modificar según los requisitos
        emailNotification: false
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
 * @returns True si la restauración fue exitosa
 */
export async function restoreBackup(backupId: string): Promise<boolean> {
  try {
    logger.info(`Iniciando restauración de respaldo: ${backupId}`);

    // Verificar que el respaldo existe
    const backup = await prisma.backup.findUnique({ where: { id: backupId } });
    if (!backup) {
      throw new Error(`Respaldo no encontrado: ${backupId}`);
    }

    const backupPath = backup.filePath;
    if (!FileSystem.existsSync(backupPath)) {
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

      if (FileSystem.existsSync(docsBackupPath)) {
        // Respaldar documentos actuales
        const tempDocsBackup = path.join(
          userDataPath,
          `documents_pre_restore_${Date.now()}`
        );
        if (FileSystem.existsSync(docsPath)) {
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
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    logger.info(`Eliminando respaldo: ${backupId}`);

    // Verificar que el respaldo existe
    const backup = await prisma.backup.findUnique({ where: { id: backupId } });
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
export async function getBackups(): Promise<any[]> {
  try {
    const backups = await prisma.backup.findMany({
      orderBy: { createdAt: "desc" },
    });
    return backups;
  } catch (error) {
    logger.error("Error al obtener respaldos:", error);
    throw new Error(`Error al obtener respaldos: ${error.message}`);
  }
}

/**
 * Calcula el tamaño de un directorio en bytes
 * @param dirPath Ruta del directorio
 * @returns Tamaño en bytes
 */
async function calculateDirectorySize(dirPath: string): Promise<number> {
  try {
    let size = 0;
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        size += stat.size;
      } else if (stat.isDirectory()) {
        size += await calculateDirectorySize(filePath);
      }
    }

    return size;
  } catch (error) {
    logger.error("Error al calcular el tamaño del directorio:", error);
    return 0;
  }
}
