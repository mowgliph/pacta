/**
 * Combina todas las interfaces de solicitudes en una sola
 */

import type { AppRequests } from './app.channels';
import type { AuthRequests } from './auth.channels';
import type { BackupRequests } from './backup.channels';
import type { ContractsRequests } from './contracts.channels';
import type { DocumentsRequests } from './documents.channels';
import type { NotificationsRequests } from './notifications.channels';
import type { RolesRequests, UsersRequests } from './users.channels';
import type { SettingsRequests } from './settings.channels';
import type { SupplementsRequests } from './supplements.channels';

/**
 * Tipo combinado de todas las interfaces de solicitudes
 */
export type AllRequests = 
  & AppRequests
  & AuthRequests
  & BackupRequests
  & ContractsRequests
  & DocumentsRequests
  & NotificationsRequests
  & RolesRequests
  & SettingsRequests
  & SupplementsRequests
  & UsersRequests;