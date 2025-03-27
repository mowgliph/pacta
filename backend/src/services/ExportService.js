/**
 * Servicio de exportación de backups
 * @module services/ExportService
 */
import fs from 'fs/promises';
import path from 'path';
import { createGzip } from 'zlib';
import { PrismaClient } from '@prisma/client';
import config from '../config/app.config.js';
import logger from '../utils/logger.js';
import { getNormalizedPath } from '../utils/paths.js';
import { verifyBackupIntegrity } from '../utils/backup.js';
import { 
  createZipArchive,
  createTarArchive,
  createEncryptedArchive
} from '../utils/exportFormats.js';

class ExportService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Exporta un backup en formato específico
   * @param {number} backupId - ID del backup
   * @param {Object} options - Opciones de exportación
   * @returns {Promise<Object>} Resultado de la exportación
   */
  async exportBackup(backupId, options = {}) {
    const {
      format = 'zip',
      compression = { enabled: true, level: 6 },
      includeMetadata = true
    } = options;

    try {
      // Obtener backup
      const backup = await this.prisma.backup.findUnique({
        where: { id: backupId }
      });

      if (!backup) {
        throw new Error('Backup no encontrado');
      }

      // Verificar integridad
      const backupPath = getNormalizedPath(
        path.join(
          config.backup.basePath,
          config.backup.directories[backup.type],
          backup.filename
        )
      );

      const isValid = await verifyBackupIntegrity(backupPath, backup);
      if (!isValid) {
        throw new Error('El backup está corrupto o ha sido modificado');
      }

      // Preparar directorio temporal
      const tempDir = getNormalizedPath(
        path.join(config.backup.basePath, config.backup.directories.temp)
      );
      
      // Generar nombre único para la exportación
      const exportName = `export-${Date.now()}-${backup.filename}`;
      const exportPath = path.join(tempDir, exportName);

      // Procesar backup según formato
      const exportedData = await this.processExport(backup, backupPath, {
        format,
        compression,
        includeMetadata
      });

      // Guardar archivo exportado
      await fs.writeFile(exportPath, exportedData);

      // Registrar exportación
      const exportMeta = await this.prisma.export.create({
        data: {
          backupId: backup.id,
          filename: exportName,
          format,
          size: exportedData.length,
          compressionEnabled: compression.enabled,
          compressionLevel: compression.level,
          includesMetadata: includeMetadata,
          createdAt: new Date()
        }
      });

      logger.info(`Backup exported successfully: ${exportName}`, {
        format,
        size: exportedData.length
      });

      return {
        path: exportPath,
        metadata: exportMeta
      };
    } catch (error) {
      logger.error('Error exporting backup:', error);
      throw error;
    }
  }

  /**
   * Procesa el backup para exportación
   * @private
   */
  async processExport(backup, backupPath, options) {
    const data = await fs.readFile(backupPath);
    let processedData = data;

    if (options.compression.enabled) {
      processedData = await this.compressData(data, options.compression.level);
    }

    if (options.includeMetadata) {
      processedData = await this.appendMetadata(processedData, backup);
    }

    switch (options.format.toLowerCase()) {
      case 'zip':
        return this.createZipArchive(processedData, backup);
      case 'tar':
        return this.createTarArchive(processedData, backup);
      case 'encrypted':
        return this.createEncryptedArchive(processedData, backup);
      default:
        return processedData;
    }
  }

  /**
   * Comprime datos
   * @private
   */
  async compressData(data, level) {
    return new Promise((resolve, reject) => {
      const gzip = createGzip({ level });
      const chunks = [];
      
      gzip.on('data', chunk => chunks.push(chunk));
      gzip.on('end', () => resolve(Buffer.concat(chunks)));
      gzip.on('error', reject);
      
      gzip.end(data);
    });
  }

  /**
   * Añade metadata al archivo
   * @private
   */
  async appendMetadata(data, backup) {
    const metadata = {
      id: backup.id,
      type: backup.type,
      createdAt: backup.createdAt,
      size: backup.size,
      version: config.version
    };

    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    return Buffer.concat([
      data,
      Buffer.from('\n---METADATA---\n'),
      metadataBuffer
    ]);
  }

  // Métodos específicos para cada formato de exportación
  async createZipArchive(data, backup) {
    return createZipArchive(data, backup);
  }

  async createTarArchive(data, backup) {
    return createTarArchive(data, backup);
  }

  async createEncryptedArchive(data, backup) {
    return createEncryptedArchive(data, backup);
  }
}

export default new ExportService();