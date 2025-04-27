import { BrowserWindow } from 'electron';
import { setupAppHandlers } from './app';
import { setupAuthHandlers } from './auth';
import { setupContractHandlers } from './contracts';
import { setupSupplementHandlers } from './supplements';
import { setupUserHandlers } from './users';
import { setupDocumentHandlers } from './documents';
import { setupNotificationHandlers } from './notifications';
import { setupBackupHandlers } from './backup';
import { setupEnvHandlers } from './env';

/**
 * Configura todos los manejadores IPC
 * @param mainWindow - Ventana principal de la aplicación
 */
export function setupIpcHandlers(mainWindow: BrowserWindow): void {
  // Configurar todos los manejadores IPC
  setupAppHandlers(mainWindow);
  setupAuthHandlers();
  setupContractHandlers();
  setupSupplementHandlers();
  setupUserHandlers();
  setupDocumentHandlers();
  setupNotificationHandlers();
  setupBackupHandlers();
  setupEnvHandlers();
}