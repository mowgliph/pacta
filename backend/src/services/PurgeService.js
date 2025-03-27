/**
 * Servicio de purga de backups
 * @module services/PurgeService
 */
import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import config from '../config/app.config.js';
import logger from '../utils/logger.js';
import { getNormalizedPath } from '../utils/paths.js';
import { verifyBackupIntegrity } from '../utils/backup.js';

class PurgeService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Ejecuta la limpieza automática de backups
   * @returns {Promise<void>}
   */
  async executePurge() {
    logger.info('Starting backup purge process');
    const startTime = Date.now();

    try {
      await this.purgeAutomaticBackups();
      await this.purgeManualBackups();
      await this.cleanupOrphanedFiles();
      await this.cleanupMetadata();

      logger.info('Backup purge completed', {
        duration: Date.now() - startTime
      });
    } catch (error) {
      logger.error('Backup purge failed:', error);
      throw error;
    }
  }

  /**
   * Purga backups automáticos según política de retención
   * @private
   */
  async purgeAutomaticBackups() {
    const retentionDays = config.backup.retention.autoBackupDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const oldBackups = await this.prisma.backup.findMany({
      where: {
        type: 'auto',
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    for (const backup of oldBackups) {
      await this.deleteBackup(backup);
    }

    logger.info(`Purged ${oldBackups.length} automatic backups`);
  }

  /**
   * Purga backups manuales excedentes
   * @private
   */
  async purgeManualBackups() {
    const maxManualBackups = config.backup.retention.manualBackupCount;
    
    const manualBackups = await this.prisma.backup.findMany({
      where: { type: 'manual' },
      orderBy: { createdAt: 'desc' },
      skip: maxManualBackups
    });

    for (const backup of manualBackups) {
      await this.deleteBackup(backup);
    }

    logger.info(`Purged ${manualBackups.length} manual backups`);
  }

  /**
   * Elimina un backup específico
   * @private
   * @param {Object} backup - Registro de backup
   */
  async deleteBackup(backup) {
    try {
      const backupPath = getNormalizedPath(
        path.join(
          config.backup.basePath,
          config.backup.directories[backup.type],
          backup.filename
        )
      );

      // Verificar integridad antes de eliminar
      const isValid = await verifyBackupIntegrity(backupPath, backup);
      if (!isValid) {
        logger.warn(`Integrity check failed for backup: ${backup.filename}`);
      }

      // Eliminar archivo
      await fs.unlink(backupPath);
      
      // Eliminar metadata
      await this.prisma.backup.delete({
        where: { id: backup.id }
      });

      logger.info(`Deleted backup: ${backup.filename}`);
    } catch (error) {
      logger.error(`Error deleting backup ${backup.filename}:`, error);
      throw error;
    }
  }

  /**
   * Limpia archivos huérfanos
   * @private
   */
  async cleanupOrphanedFiles() {
    const backupDirs = [
      config.backup.directories.auto,
      config.backup.directories.manual
    ];

    for (const dir of backupDirs) {
      const dirPath = getNormalizedPath(path.join(config.backup.basePath, dir));
      const files = await fs.readdir(dirPath);

      for (const file of files) {
        const exists = await this.prisma.backup.findFirst({
          where: { filename: file }
        });

        if (!exists) {
          await fs.unlink(path.join(dirPath, file));
          logger.info(`Removed orphaned file: ${file}`);
        }
      }
    }
  }

  /**
   * Limpia metadata huérfana
   * @private
   */
  async cleanupMetadata() {
    const backups = await this.prisma.backup.findMany();

    for (const backup of backups) {
      const backupPath = getNormalizedPath(
        path.join(
          config.backup.basePath,
          config.backup.directories[backup.type],
          backup.filename
        )
      );

      try {
        await fs.access(backupPath);
      } catch {
        await this.prisma.backup.delete({
          where: { id: backup.id }
        });
        logger.info(`Removed orphaned metadata for: ${backup.filename}`);
      }
    }
  }
}

export default new PurgeService();