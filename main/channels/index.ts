/**
 * Archivo índice que exporta todos los canales IPC
 * Facilita la importación centralizada de todos los canales
 */

// Exportamos enums directamente
export { AppChannels } from "./app.channels";
export { AuthChannels } from "./auth.channels";
export { BackupChannels } from "./backup.channels";
export { ContractsChannels } from "./contracts.channels";
export { DocumentsChannels } from "./documents.channels";
export { NotificationChannels } from "./notifications.channels";
export { RolesChannels, UsersChannels } from "./users.channels";
export { SettingsChannels } from "./settings.channels";
export { SupplementsChannels } from "./supplements.channels";

// Exportamos interfaces de tipo con 'export type'
export type { AppRequests } from "./app.channels";
export type { AuthRequests } from "./auth.channels";
export type { BackupRequests } from "./backup.channels";
export type { ContractsRequests } from "./contracts.channels";
export type { DocumentsRequests } from "./documents.channels";
export type { NotificationsRequests } from "./notifications.channels";
export type { RolesRequests, UsersRequests } from "./users.channels";
export type { SettingsRequests } from "./settings.channels";
export type { SupplementsRequests } from "./supplements.channels";

// Exportamos tipos de utilidad
export type { AllChannels } from "./channels";
export type { AllRequests } from "./requests";
export type { IpcRequest, IpcResponse } from "./types";

import { registerAuthChannels } from "./auth.channels";
import { registerContractChannels } from "./contracts.channels";
import { registerDashboardChannels } from "./dashboard.channels";
import { registerExportChannels } from "./export.channels";
import { registerNotificationChannels } from "./notifications.channels";
import { registerSecurityChannels } from "./security.channels";
import { registerUserChannels } from "./users.channels";

export function registerAllChannels() {
  registerAuthChannels();
  registerContractChannels();
  registerDashboardChannels();
  registerExportChannels();
  registerNotificationChannels();
  registerSecurityChannels();
  registerUserChannels();
}
