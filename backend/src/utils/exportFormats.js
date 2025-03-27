/**
 * Utilidades para formatos de exportación de backups
 * @module utils/exportFormats
 */
import archiver from 'archiver';
import { createCipheriv } from 'crypto';
import tar from 'tar-stream';
import { createGzip } from 'zlib';
import config from '../config/app.config.js';
import logger from './logger.js';

/**
 * Crea un archivo ZIP con los datos proporcionados
 * @param {Buffer} data - Datos a comprimir
 * @param {Object} metadata - Metadata del backup
 * @returns {Promise<Buffer>} Datos comprimidos
 */
export async function createZipArchive(data, metadata) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('data', chunk => chunks.push(chunk));
    archive.on('error', reject);
    archive.on('warning', err => {
      if (err.code !== 'ENOENT') {
        logger.warn('ZIP compression warning:', err);
      }
    });
    archive.on('end', () => resolve(Buffer.concat(chunks)));

    // Agregar el archivo principal
    archive.append(data, { name: metadata.filename });

    // Agregar archivo de metadata
    const metadataContent = JSON.stringify({
      ...metadata,
      exportedAt: new Date().toISOString(),
      format: 'zip'
    }, null, 2);
    
    archive.append(metadataContent, { name: 'metadata.json' });
    archive.finalize();
  });
}

/**
 * Crea un archivo TAR con los datos proporcionados
 * @param {Buffer} data - Datos a comprimir
 * @param {Object} metadata - Metadata del backup
 * @returns {Promise<Buffer>} Datos comprimidos
 */
export async function createTarArchive(data, metadata) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const pack = tar.pack();
    const gzip = createGzip();

    gzip.on('data', chunk => chunks.push(chunk));
    gzip.on('end', () => resolve(Buffer.concat(chunks)));
    gzip.on('error', reject);

    // Agregar archivo principal
    pack.entry({ name: metadata.filename }, data);

    // Agregar metadata
    const metadataContent = JSON.stringify({
      ...metadata,
      exportedAt: new Date().toISOString(),
      format: 'tar'
    }, null, 2);
    
    pack.entry({ name: 'metadata.json' }, metadataContent);
    pack.finalize();

    // Conectar pack con gzip
    pack.pipe(gzip);
  });
}

/**
 * Crea un archivo cifrado con los datos proporcionados
 * @param {Buffer} data - Datos a cifrar
 * @param {Object} metadata - Metadata del backup
 * @returns {Promise<Buffer>} Datos cifrados
 */
export async function createEncryptedArchive(data, metadata) {
  try {
    // Generar IV único
    const iv = crypto.randomBytes(16);
    
    // Crear cipher con la clave de configuración
    const cipher = createCipheriv(
      config.backup.encryption.algorithm,
      Buffer.from(config.security.encryptionKey),
      iv
    );

    // Cifrar datos
    const encryptedData = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);

    // Crear contenedor con metadata
    const container = {
      iv: iv.toString('hex'),
      metadata: {
        ...metadata,
        exportedAt: new Date().toISOString(),
        format: 'encrypted'
      },
      data: encryptedData.toString('base64')
    };

    return Buffer.from(JSON.stringify(container));
  } catch (error) {
    logger.error('Error creating encrypted archive:', error);
    throw error;
  }
}