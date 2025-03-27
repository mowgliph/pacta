/**
 * Utilidades de compresión de archivos
 * @module utils/compression
 */
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { logger } from './logger.js';

/**
 * Comprime un directorio en un archivo ZIP
 * @param {string} sourceDir - Directorio fuente a comprimir
 * @param {string} outputPath - Ruta del archivo ZIP de salida
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<Buffer>} Buffer con los datos comprimidos
 */
export async function compressDirectory(sourceDir, options = {}) {
  const {
    level = 9,
    ignore = [],
    includeBaseDir = false
  } = options;

  return new Promise(async (resolve, reject) => {
    try {
      const chunks = [];
      const archive = archiver('zip', {
        zlib: { level },
      });

      // Capturar datos del stream
      archive.on('data', chunk => chunks.push(chunk));
      archive.on('error', err => reject(err));
      archive.on('warning', err => {
        if (err.code !== 'ENOENT') {
          logger.warn('Compression warning:', err);
        }
      });

      // Resolver cuando se complete
      archive.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      // Obtener lista de archivos recursivamente
      const files = await getFilesRecursively(sourceDir);

      // Agregar archivos al ZIP
      for (const file of files) {
        const relativePath = path.relative(sourceDir, file);
        
        // Verificar si el archivo debe ser ignorado
        if (ignore.some(pattern => relativePath.match(pattern))) {
          continue;
        }

        const fileStats = await fs.stat(file);
        if (fileStats.isFile()) {
          const fileData = await fs.readFile(file);
          archive.append(fileData, {
            name: includeBaseDir ? 
              path.join(path.basename(sourceDir), relativePath) : 
              relativePath
          });
        }
      }

      // Finalizar el archivo
      archive.finalize();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Obtiene lista recursiva de archivos en un directorio
 * @private
 * @param {string} dir - Directorio a escanear
 * @returns {Promise<string[]>} Lista de rutas de archivos
 */
async function getFilesRecursively(dir) {
  const files = [];
  
  async function scan(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}

/**
 * Comprime múltiples archivos en un ZIP
 * @param {Array<{path: string, name: string}>} files - Archivos a comprimir
 * @param {Object} options - Opciones de compresión
 * @returns {Promise<Buffer>} Buffer con los datos comprimidos
 */
export async function compressFiles(files, options = {}) {
  const {
    level = 9,
    comment = ''
  } = options;

  return new Promise((resolve, reject) => {
    const chunks = [];
    const archive = archiver('zip', {
      zlib: { level },
      comment
    });

    archive.on('data', chunk => chunks.push(chunk));
    archive.on('error', reject);
    archive.on('end', () => resolve(Buffer.concat(chunks)));

    for (const file of files) {
      archive.file(file.path, { name: file.name });
    }

    archive.finalize();
  });
}