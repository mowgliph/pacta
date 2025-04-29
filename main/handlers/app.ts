import { app, BrowserWindow, dialog, shell } from 'electron';
import { withErrorHandling } from '../setup';
import { logger } from '../../utils/logger';
import { z } from 'zod';
import path from 'path';
import { ErrorHandler } from '../error-handler';
import { AppChannels } from '../channels/app.channels';

// Esquemas de validación
const openFileSchema = z.object({
  filters: z.array(
    z.object({
      name: z.string(),
      extensions: z.array(z.string())
    })
  ).optional(),
  properties: z.array(z.string()).optional(),
  defaultPath: z.string().optional()
});

const confirmDialogSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'error', 'question', 'warning', 'none']).optional()
});

// Lista de extensiones permitidas para archivos
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'xlsx', 'xls', 'csv', 'sqlite', 'db'];

export function setupAppHandlers(mainWindow: BrowserWindow): void {
  // Minimizar ventana
  withErrorHandling(AppChannels.MINIMIZE, async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
    return { success: true };
  });

  // Maximizar/restaurar ventana
  withErrorHandling(AppChannels.MAXIMIZE, async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
    }
    return { success: true };
  });

  // Cerrar aplicación
  withErrorHandling(AppChannels.QUIT, async () => {
    try {
      app.quit();
      return { success: true };
    } catch (error) {
      logger.error('Error quitting app:', error);
      throw error;
    }
  });

  // Mostrar diálogo de selección de archivo
  withErrorHandling('dialog:openFile', async (_, options) => {
    try {
      // Validar opciones
      const { filters, properties, defaultPath } = openFileSchema.parse(options || {});
      
      // Validar filtros para asegurar que solo se permiten extensiones seguras
      if (filters) {
        const allExtensions = filters.flatMap(filter => filter.extensions);
        const hasInvalidExtension = allExtensions.some(ext => !ALLOWED_EXTENSIONS.includes(ext));
        
        if (hasInvalidExtension) {
          throw ErrorHandler.createError('ValidationError', 'Extensión de archivo no permitida');
        }
      }
      
      // Validar que el defaultPath es seguro (no incluye path traversal)
      let safeDefaultPath = undefined;
      if (defaultPath) {
        safeDefaultPath = path.normalize(defaultPath).replace(/^(\.\.[\/\\])+/, '');
        
        if (safeDefaultPath !== defaultPath) {
          logger.warn('Posible intento de path traversal en defaultPath:', defaultPath);
          throw ErrorHandler.createError('ValidationError', 'Ruta no permitida');
        }
      }
      
      // Validar properties para limitar el tipo de selección
      const safeProperties = properties || ['openFile'];
      const allowedProperties = ['openFile', 'openDirectory', 'multiSelections', 'showHiddenFiles', 'createDirectory', 'promptToCreate', 'noResolveAliases', 'treatPackageAsDirectory', 'dontAddToRecent'];
      
      const hasInvalidProperty = safeProperties.some(prop => !allowedProperties.includes(prop));
      if (hasInvalidProperty) {
        throw ErrorHandler.createError('ValidationError', 'Propiedad no permitida');
      }
      
      const result = await dialog.showOpenDialog(mainWindow, {
        defaultPath: safeDefaultPath,
        filters: filters as Electron.FileFilter[],
        properties: safeProperties as any
      });
      
      return {
        canceled: result.canceled,
        filePaths: result.filePaths
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error in dialog:openFile:', error.errors);
        throw ErrorHandler.createError('ValidationError', 'Opciones de diálogo inválidas');
      }
      throw error;
    }
  });

  // Mostrar diálogo de confirmación
  withErrorHandling('dialog:confirm', async (_, dialogOptions) => {
    try {
      // Validar opciones
      const { title, message, type = 'question' } = confirmDialogSchema.parse(dialogOptions);
      
      // Sanitizar los textos para evitar inyecciones
      const safeTitle = sanitizeText(title);
      const safeMessage = sanitizeText(message);
      
      const result = await dialog.showMessageBox(mainWindow, {
        type: type,
        title: safeTitle,
        message: safeMessage,
        buttons: ['Cancelar', 'Aceptar'],
        defaultId: 1,
        cancelId: 0
      });
      
      return {
        confirmed: result.response === 1
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error in dialog:confirm:', error.errors);
        throw ErrorHandler.createError('ValidationError', 'Opciones de diálogo inválidas');
      }
      throw error;
    }
  });

  // Abrir URL externa (con validación)
  withErrorHandling('shell:openExternal', async (_, url) => {
    try {
      if (typeof url !== 'string') {
        throw ErrorHandler.createError('ValidationError', 'URL debe ser una cadena de texto');
      }
      
      // Lista de dominios permitidos
      const allowedDomains = [
        'pacta.com',
        'github.com',
        'electronjs.org'
      ];
      
      // Validar la URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      // Comprobar si el dominio está permitido
      const isDomainAllowed = allowedDomains.some(allowedDomain => 
        domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
      );
      
      if (!isDomainAllowed) {
        logger.warn(`Intento de abrir URL no permitida: ${url}`);
        throw ErrorHandler.createError('ValidationError', 'URL no permitida');
      }
      
      // Solo permitir http/https
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        logger.warn(`Intento de abrir URL con protocolo no permitido: ${url}`);
        throw ErrorHandler.createError('ValidationError', 'Protocolo no permitido');
      }
      
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Invalid URL')) {
        throw ErrorHandler.createError('ValidationError', 'URL inválida');
      }
      throw error;
    }
  });

  // Obtener información del sistema
  withErrorHandling(AppChannels.VERSION, async () => {
    return {
      version: app.getVersion(),
      arch: process.arch,
      platform: process.platform,
      userDataPath: app.getPath('userData')
    };
  });
}

// Función para sanitizar texto de forma completa
function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  // Lista de expresiones regulares maliciosas
  const dangerousPatterns = [
    /javascript:/gi,
    /data:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,  // eventos como onclick, onload, etc.
    /\beval\s*\(/gi,
    /document\./gi,
    /window\./gi,
    /alert\s*\(/gi,
    /\bURL\s*\(/gi,
    /\bdocument\b/gi,
    /\blocation\b/gi,
  ];
  
  // Reemplazar patrones peligrosos
  let safeText = text;
  
  // Reemplazar todos los patrones peligrosos
  dangerousPatterns.forEach(pattern => {
    safeText = safeText.replace(pattern, '');
  });
  
  return safeText
    // Eliminar etiquetas HTML
    .replace(/<[^>]*>/g, '')
    // Escapar caracteres especiales para prevenir XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    // Eliminar caracteres Unicode potencialmente engañosos/confusos
    .replace(/[\u00A0-\u9999<>\&]/g, (i) => '&#' + i.charCodeAt(0) + ';')
    // Eliminar caracteres de control y no imprimibles
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Limitar longitud
    .substring(0, 1000);
} 