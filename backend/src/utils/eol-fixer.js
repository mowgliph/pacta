/**
 * Utilidad para normalizar los finales de línea en archivos
 * Ayuda a prevenir problemas comunes de ESLint/Prettier relacionados con EOL
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio base del proyecto
const PROJECT_ROOT = path.resolve(__dirname, '../../');

// Extensiones de archivos a procesar
const FILE_EXTENSIONS = ['.js', '.json', '.md'];

// Directorios a excluir
const EXCLUDED_DIRS = ['node_modules', 'dist', 'coverage', '.git'];

/**
 * Normaliza los finales de línea en un archivo
 * @param {string} filePath - Ruta al archivo
 */
async function normalizeFileEol(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Normalizar a LF (\n)
    const normalized = content.replace(/\r\n/g, '\n');
    
    // Asegurar que el archivo termine con un salto de línea
    const ensureEndingNewLine = normalized.endsWith('\n') ? normalized : `${normalized}\n`;
    
    // Solo escribir si ha habido cambios
    if (content !== ensureEndingNewLine) {
      await fs.writeFile(filePath, ensureEndingNewLine, 'utf8');
      console.log(`✅ Normalizado: ${path.relative(PROJECT_ROOT, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error al procesar ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Procesa recursivamente un directorio
 * @param {string} dir - Directorio a procesar
 * @returns {Promise<number>} - Número de archivos procesados
 */
async function processDirectory(dir) {
  let processedCount = 0;
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Saltar directorios excluidos
        if (EXCLUDED_DIRS.includes(entry.name)) {
          continue;
        }
        
        // Procesar subdirectorio recursivamente
        processedCount += await processDirectory(fullPath);
      } else if (entry.isFile()) {
        // Procesar solo archivos con extensiones específicas
        const ext = path.extname(entry.name).toLowerCase();
        if (FILE_EXTENSIONS.includes(ext)) {
          const wasProcessed = await normalizeFileEol(fullPath);
          if (wasProcessed) {
            processedCount++;
          }
        }
      }
    }
    
    return processedCount;
  } catch (error) {
    console.error(`❌ Error al procesar el directorio ${dir}:`, error.message);
    return processedCount;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🔄 Normalizando finales de línea en archivos del proyecto...');
  
  const startTime = Date.now();
  const processedCount = await processDirectory(PROJECT_ROOT);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`✨ Completado en ${duration}s. ${processedCount} archivos fueron normalizados.`);
}

// Ejecutar si se llama directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
}

export { normalizeFileEol, processDirectory }; 