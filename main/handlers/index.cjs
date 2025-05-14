import { BrowserWindow } from "electron";
import { EventManager } from "../events/event-manager.cjs";
import { registerAuthHandlers } from "./auth.handlers.cjs";
import { registerContractHandlers } from "./contract.handlers.cjs";
import { registerDocumentHandlers } from "./document.handlers.cjs";
import { registerUserHandlers } from "./user.handlers.cjs";
import { registerSystemHandlers } from "./system.handlers.cjs";
import { registerNotificationHandlers } from "./notification.handlers.cjs";
import { registerRoleHandlers } from "./role.handlers.cjs";
import { registerSupplementHandlers } from "./supplement.handlers.cjs";
import { registerStatisticsHandlers } from "./statistics.handlers.cjs";

/**
 * Configura todos los manejadores IPC
 * @param mainWindow - Ventana principal de la aplicación
 * @param eventManager - Gestor de eventos de la aplicación
 */
export function setupIpcHandlers(
  mainWindow: BrowserWindow,
  eventManager: EventManager
): void {
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
