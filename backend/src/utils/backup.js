/**
 * Utilidades de verificación de backups
 * @module utils/backup
 */
import fs from 'fs/promises';
import crypto from 'crypto';
import { createGunzip } from 'zlib';
import { createDecipheriv } from 'crypto';
import config from '../config/app.config.js';
import logger from './logger.js';

/**
 * Verifica la integridad de un archivo de backup
 * @param {string} filePath - Ruta del archivo
 * @param {Object} metadata - Metadata del backup
 * @returns {Promise<boolean>} Resultado de la verificación
 */
export async function verifyBackupIntegrity(filePath, metadata) {
  try {
    // Verificar existencia
    const stats = await fs.stat(filePath);
    if (stats.size !== metadata.size) {
      logger.warn('Backup size mismatch', {
        expected: metadata.size,
        actual: stats.size
      });
      return false;
    }

    // Leer archivo
    const data = await fs.readFile(filePath);

    // Verificar cifrado si está habilitado
    if (config.backup.encryption.enabled && metadata.iv) {
      try {
        const decipher = createDecipheriv(
          config.backup.encryption.algorithm,
          Buffer.from(config.security.encryptionKey),
          Buffer.from(metadata.iv, 'hex')
        );

        const decrypted = Buffer.concat([
          decipher.update(data),
          decipher.final()
        ]);

        // Verificar descompresión
        await new Promise((resolve, reject) => {
          const gunzip = createGunzip();
          gunzip.on('error', reject);
          gunzip.on('end', resolve);
          gunzip.end(decrypted);
        });
      } catch (error) {
        logger.error('Backup decryption/decompression failed:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error('Backup integrity check failed:', error);
    return false;
  }
}