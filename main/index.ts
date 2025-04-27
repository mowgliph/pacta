import { app } from 'electron';
import { AppManager } from './app-manager';
import { logger } from './utils/logger';
import { registerApiRequestHandler } from './ipc/handlers/api-request';

/**
 * Punto de entrada principal de la aplicación Electron
 * Utiliza el patrón de arquitectura modular con el AppManager
 */
async function main() {
  try {
    // Prevenir múltiples instancias de la aplicación
    const gotTheLock = app.requestSingleInstanceLock();
    
    if (!gotTheLock) {
      logger.info('Otra instancia ya está en ejecución. Cerrando esta instancia.');
      app.quit();
      return;
    }
    
    // Configurar el manejo de segundas instancias
    app.on('second-instance', (_event, commandLine, _workingDirectory) => {
      logger.info('Se detectó un intento de abrir una segunda instancia', {
        commandLine
      });
      
      // Obtener la instancia del AppManager
      const appManager = AppManager.getInstance();
      
      // Si hay ventanas existentes, restaurar y enfocar la principal
      appManager.focusMainWindow();
      
      // Procesar argumentos de línea de comandos si es necesario
      if (commandLine.length > 1) {
        appManager.processCommandLineArgs(commandLine);
      }
    });
    

    // Evitar navegación a URLs externas (protección contra redirecciones)
    app.on('web-contents-created', (_event, contents) => {
      contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        // Solo permitir navegación dentro de la aplicación 
        // (file:// o http://localhost)
        if (
          parsedUrl.protocol !== 'file:' && 
          !(parsedUrl.protocol === 'http:' && parsedUrl.hostname === 'localhost')
        ) {
          logger.warn('Navegación bloqueada a URL externa:', navigationUrl);
          event.preventDefault();
        }
      });
      
      // Prevenir la creación de nuevas ventanas desde el renderer
      contents.setWindowOpenHandler(({ url }) => {
        logger.warn('Intento de abrir nueva ventana bloqueado:', url);
        return { action: 'deny' };
      });
    });

    // Crear y obtener la instancia del gestor de la aplicación
    const appManager = AppManager.getInstance();
    
    // Registro de manejadores IPC
    registerApiRequestHandler();
    
    // Inicializar la aplicación
    await appManager.initialize();
    
  } catch (error) {
    logger.error('Error crítico al iniciar la aplicación:', error);
    process.exit(1);
  }
}

// Configurar manejo global de excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error('Error crítico no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada:', reason);
});

// Iniciar la aplicación
main().catch(error => {
  logger.error('Error no capturado en el punto de entrada:', error);
  app.exit(1);
}); 