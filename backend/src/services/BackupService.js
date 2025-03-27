/**
 * Servicio de gestión de backups
 * @module services/BackupService
 */
import fs from 'fs/promises';
import path from 'path';
import { createGzip } from 'zod';
import { createCipheriv, randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';
import config from '../config/app.config.js';
import logger from '../utils/logger.js';
import { ensureDirectoryExists, getNormalizedPath } from '../utils/paths.js';
import { compressDirectory } from '../utils/compression.js';

class BackupService {
  constructor() {
    this.prisma = new PrismaClient();
    this.initializeDirectories();
  }

  /**
   * Inicializa los directorios necesarios para backups
   * @private
   */
  async initializeDirectories() {
    const dirs = [
      config.backup.basePath,
      path.join(config.backup.basePath, config.backup.directories.auto),
      path.join(config.backup.basePath, config.backup.directories.manual),
      path.join(config.backup.basePath, config.backup.directories.temp)
    ];

    for (const dir of dirs) {
      await ensureDirectoryExists(getNormalizedPath(dir));
    }
  }

  /**
   * Genera nombre único para el archivo de backup
   * @private
   * @param {string} type - Tipo de backup ('auto' | 'manual')
   * @returns {string} Nombre del archivo
   */
  generateBackupFilename(type = 'auto') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `backup-${type}-${timestamp}.zip`;
  }

  /**
   * Comprime y cifra datos
   * @private
   * @param {Buffer} data - Datos a procesar
   * @returns {Promise<{data: Buffer, iv: Buffer}>} Datos procesados
   */
  async compressAndEncrypt(data) {
    // Compresión
    const compressed = await new Promise((resolve, reject) => {
      const gzip = createGzip({ level: config.backup.compression.level });
      const chunks = [];
      
      gzip.on('data', chunk => chunks.push(chunk));
      gzip.on('end', () => resolve(Buffer.concat(chunks)));
      gzip.on('error', reject);
      
      gzip.end(data);
    });

    // Cifrado
    if (config.backup.encryption.enabled) {
      const iv = randomBytes(16);
      const cipher = createCipheriv(
        config.backup.encryption.algorithm,
        Buffer.from(config.security.encryptionKey),
        iv
      );

      const encrypted = Buffer.concat([
        cipher.update(compressed),
        cipher.final()
      ]);

      return { data: encrypted, iv };
    }

    return { data: compressed, iv: null };
  }

  /**
   * Realiza backup de la base de datos
   * @private
   * @returns {Promise<Buffer>} Datos de la base de datos
   */
  async backupDatabase() {
    try {
      // Obtener ruta de la base de datos SQLite
      const dbPath = config.database.url.replace('file:', '');
      
      // Leer archivo de base de datos
      const dbData = await fs.readFile(dbPath);
      
      logger.info('Database backup completed successfully');
      return dbData;
    } catch (error) {
      logger.error('Error backing up database:', error);
      throw error;
    }
  }

  /**
   * Realiza backup de archivos
   * @private
   * @returns {Promise<Buffer>} Datos de archivos
   */
  async backupFiles() {
    try {
      const uploadDir = getNormalizedPath(config.files.uploadDir);
      
      // Verificar si el directorio existe
      if (!await fs.access(uploadDir).then(() => true).catch(() => false)) {
        logger.warn('Upload directory does not exist, skipping files backup');
        return null;
      }

      // Comprimir directorio de archivos
      const compressedData = await compressDirectory(uploadDir, {
        level: config.backup.compression.level,
        ignore: [
          /\.tmp$/,
          /\.temp$/,
          /^thumbs\.db$/i,
          /^\.DS_Store$/
        ],
        includeBaseDir: true
      });
      
      logger.info('Files backup completed successfully', {
        size: compressedData.length,
        directory: uploadDir
      });

      return compressedData;
    } catch (error) {
      logger.error('Error backing up files:', error);
      throw error;
    }
  }

  /**
   * Ejecuta el proceso de backup
   * @param {string} type - Tipo de backup ('auto' | 'manual')
   * @returns {Promise<void>}
   */
  async executeBackup(type = 'auto') {
    const startTime = Date.now();
    logger.info(`Starting ${type} backup process`);

    try {
      // Backup de base de datos
      const dbData = await this.backupDatabase();
      
      // Backup de archivos
      const filesData = await this.backupFiles();
      
      // Comprimir y cifrar
      const { data: processedData, iv } = await this.compressAndEncrypt(
        Buffer.concat([dbData, filesData || Buffer.from([])])
      );

      // Guardar backup
      const filename = this.generateBackupFilename(type);
      const backupPath = getNormalizedPath(
        path.join(
          config.backup.basePath,
          config.backup.directories[type],
          filename
        )
      );

      await fs.writeFile(backupPath, processedData);
      
      // Guardar metadata
      await this.saveBackupMetadata({
        filename,
        type,
        size: processedData.length,
        iv: iv?.toString('hex'),
        createdAt: new Date(),
        duration: Date.now() - startTime
      });

      logger.info(`Backup completed successfully: ${filename}`);
    } catch (error) {
      logger.error('Backup process failed:', error);
      throw error;
    }
  }

  /**
   * Guarda metadata del backup
   * @private
   * @param {Object} metadata - Metadata del backup
   */
  async saveBackupMetadata(metadata) {
    try {
      await this.prisma.backup.create({
        data: metadata
      });
    } catch (error) {
      logger.error('Error saving backup metadata:', error);
      throw error;
    }
  }

  /**
   * Lista los backups disponibles
   * @param {Object} options - Opciones de listado
   * @returns {Promise<Array>} Lista de backups
   */
  async listBackups(options = {}) {
    const {
      type,
      limit = 50,
      offset = 0,
      sort = 'createdAt',
      order = 'desc'
    } = options;

    const where = type ? { type } : {};

    return this.prisma.backup.findMany({
      where,
      orderBy: { [sort]: order.toLowerCase() },
      take: limit,
      skip: offset
    });
  }

  /**
   * Obtiene información de espacio en disco
   * @returns {Promise<Object>} Información de espacio
   */
  async getSpaceInfo() {
    const { total, free } = await checkDiskSpace(config.backup.basePath);
    const backups = await this.prisma.backup.aggregate({
      _sum: { size: true },
      _count: true
    });

    return {
      total,
      free,
      used: backups._sum.size || 0,
      count: backups._count,
      minRequired: parseBytes(config.backup.retention.minSpace)
    };
  }

  /**
   * Obtiene detalles de un backup
   * @param {number} id - ID del backup
   * @returns {Promise<Object>} Detalles del backup
   */
  async getBackupDetails(id) {
    return this.prisma.backup.findUnique({
      where: { id: parseInt(id) }
    });
  }

  /**
   * Restaura un backup
   * @param {number} id - ID del backup
   * @param {Object} options - Opciones de restauración
   */
  async restoreBackup(id, options = {}) {
    const backup = await this.getBackupDetails(id);
    if (!backup) {
      throw new Error('Backup no encontrado');
    }

    const backupPath = getNormalizedPath(
      path.join(
        config.backup.basePath,
        config.backup.directories[backup.type],
        backup.filename
      )
    );

    // Verificar integridad
    const isValid = await verifyBackupIntegrity(backupPath, backup);
    if (!isValid) {
      throw new Error('El backup está corrupto o ha sido modificado');
    }

    // Restaurar backup
    const data = await fs.readFile(backupPath);
    
    // Descifrar si es necesario
    let decryptedData = data;
    if (backup.iv) {
      const decipher = createDecipheriv(
        config.backup.encryption.algorithm,
        Buffer.from(config.security.encryptionKey),
        Buffer.from(backup.iv, 'hex')
      );
      
      decryptedData = Buffer.concat([
        decipher.update(data),
        decipher.final()
      ]);
    }

    // Descomprimir
    const decompressed = await new Promise((resolve, reject) => {
      const gunzip = createGunzip();
      const chunks = [];
      
      gunzip.on('data', chunk => chunks.push(chunk));
      gunzip.on('end', () => resolve(Buffer.concat(chunks)));
      gunzip.on('error', reject);
      
      gunzip.end(decryptedData);
    });

    // Restaurar según opciones
    if (options.includeDatabase) {
      await this.restoreDatabase(decompressed);
    }
    
    if (options.includeFiles) {
      await this.restoreFiles(decompressed);
    }

    logger.info(`Backup ${backup.filename} restaurado exitosamente`);
  }
}

export default new BackupService();