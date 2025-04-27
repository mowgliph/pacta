/**
 * Archivo central para exportar todos los tipos de canales IPC
 */

import { AppChannels, AppRequests } from './app.channels';
import { AuthChannels, AuthRequests } from './auth.channels';
import { BackupChannels, BackupRequests } from './backup.channels';
import { ContractsChannels, ContractsRequests } from './contracts.channels';
import { DocumentsChannels, DocumentsRequests } from './documents.channels';
import { NotificationsChannels, NotificationsRequests } from './notifications.channels';
import { SupplementsChannels, SupplementsRequests } from './supplements.channels';
import { SettingsChannels, SettingsRequests } from './settings.channels';
import { UsersChannels, RolesChannels, UsersRequests, RolesRequests } from './users.channels';

/**
 * Exportar todos los enums de canales
 */
export {
  AppChannels,
  AuthChannels,
  BackupChannels,
  ContractsChannels,
  DocumentsChannels,
  NotificationsChannels,
  RolesChannels,
  SettingsChannels,
  SupplementsChannels,
  UsersChannels
};

/**
 * Tipo unión de todos los canales posibles
 */
export type AllChannels = 
  | AppChannels
  | AuthChannels
  | BackupChannels
  | ContractsChannels
  | DocumentsChannels
  | NotificationsChannels
  | RolesChannels
  | SettingsChannels
  | SupplementsChannels
  | UsersChannels;

/**
 * Tipo intersección de todas las interfaces de solicitudes
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

/**
 * Definición de interfaz genérica para solicitudes IPC
 */
export interface IpcRequest<T = any> {
  id: string;
  channel: string;
  data: T;
}

/**
 * Definición de interfaz genérica para respuestas IPC
 */
export interface IpcResponse<T = any> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
} 