import { BrowserWindow } from 'electron';
import { EventManager } from '../events/event-manager';
import { registerAuthHandlers } from './auth.handlers';
import { registerContractHandlers } from './contract.handlers';
import { registerDocumentHandlers } from './document.handlers';
import { registerUserHandlers } from './user.handlers';
import { registerSystemHandlers } from './system.handlers';
import { registerNotificationHandlers } from './notification.handlers';
import { registerRoleHandlers } from './role.handlers';
import { registerSupplementHandlers } from './supplement.handlers';
import { registerStatisticsHandlers } from './statistics.handlers';

/**
 * Configura todos los manejadores IPC
 * @param mainWindow - Ventana principal de la aplicación
 * @param eventManager - Gestor de eventos de la aplicación
 */
export function setupIpcHandlers(mainWindow: BrowserWindow, eventManager: EventManager): void {
  // Registrar todos los manejadores IPC
  registerAuthHandlers(eventManager);
  registerContractHandlers(eventManager);
  registerDocumentHandlers(eventManager);
  registerUserHandlers(eventManager);
  registerSystemHandlers(eventManager);
  registerNotificationHandlers(eventManager);
  registerRoleHandlers(eventManager);
  registerSupplementHandlers(eventManager);
  registerStatisticsHandlers(eventManager);
}