import { BrowserWindow, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../utils/constants';
import { setupContractHandlers } from './handlers/contracts';
import { setupSupplementHandlers } from './handlers/supplements';
import { setupUserHandlers } from './handlers/users';
import { setupAppHandlers } from './handlers/app';
import { setupSettingsHandlers } from './handlers/settings';
import { setupAuthHandlers } from './handlers/auth';
import { setupBackupHandlers } from './handlers/backup';
import { setupDocumentHandlers } from './handlers/documents';
import { setupNotificationHandlers } from './handlers/notifications';
import { logger } from '../utils/logger';
import { IpcErrorHandler } from './error-handler';

export function setupIpcHandlers(mainWindow: BrowserWindow): void {
  try {
    // Configurar manejadores por categoría
    setupAppHandlers(mainWindow);
    setupContractHandlers();
    setupSupplementHandlers();
    setupUserHandlers();
    setupSettingsHandlers();
    setupAuthHandlers();
    setupBackupHandlers();
    setupDocumentHandlers();
    setupNotificationHandlers();

    // Manejador global de errores IPC
    ipcMain.on('error', (event, error) => {
      logger.error('IPC Error:', error);
    });

    logger.info('IPC handlers configured successfully');
  } catch (error) {
    logger.error('Error setting up IPC handlers:', error);
    throw error;
  }
}

// Función de utilidad para envolver manejadores IPC con manejo de errores
export function withErrorHandling(
  channel: string,
  handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>
): void {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      // Usar el manejador de errores para registrar y formatear el error
      IpcErrorHandler.logError(channel, error);
      
      // Transformar el error a un formato estandarizado
      const formattedError = IpcErrorHandler.formatError(error);
      
      // En Electron, necesitamos lanzar un error para que el renderer lo reciba
      throw formattedError;
    }
  });
} 