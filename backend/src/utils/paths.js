/**
 * Utilidades para manejo de rutas
 * @module utils/paths
 */
import path from 'path';
import os from 'os';
import fs from 'fs';

/**
 * Obtiene la ruta del directorio AppData
 * @returns {string} Ruta del directorio AppData
 */
export function getAppDataPath() {
  const appDataPath = process.env.APPDATA || 
    (process.platform === 'darwin' ? 
      path.join(os.homedir(), 'Library', 'Application Support') : 
      path.join(os.homedir(), '.local', 'share'));
  
  const pactaPath = path.join(appDataPath, 'PACTA');
  
  // Crear directorio si no existe
  if (!fs.existsSync(pactaPath)) {
    fs.mkdirSync(pactaPath, { recursive: true });
  }
  
  return pactaPath;
}

/**
 * Crea un directorio si no existe
 * @param {string} dirPath - Ruta del directorio
 * @returns {void}
 */
export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Obtiene la ruta absoluta normalizada
 * @param {string} relativePath - Ruta relativa
 * @returns {string} Ruta absoluta normalizada
 */
export function getNormalizedPath(relativePath) {
  return path.normalize(path.join(getAppDataPath(), relativePath));
}