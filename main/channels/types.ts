/**
 * Archivo consolidado con todos los tipos de canales IPC
 */

import { AppChannels } from "./app.channels";
import { AuthChannels } from "./auth.channels";
import { BackupChannels } from "./backup.channels";
import { ContractsChannels } from "./contracts.channels";
import { DocumentsChannels } from "./documents.channels";
import { NotificationChannels } from "./notifications.channels";
import { RolesChannels, UsersChannels } from "./users.channels";
import { SettingsChannels } from "./settings.channels";
import { SupplementsChannels } from "./supplements.channels";
import { IPC_CHANNELS } from './ipc-channels';

/**
 * Tipo unión de todos los canales posibles
 */
export type AllChannels =
  | AppChannels
  | AuthChannels
  | BackupChannels
  | ContractsChannels
  | DocumentsChannels
  | NotificationChannels
  | RolesChannels
  | SettingsChannels
  | SupplementsChannels
  | UsersChannels;

export type IpcChannel = typeof IPC_CHANNELS;

export type IpcChannelValue = IpcChannel[keyof IpcChannel];

export type IpcChannelPath = {
  [K in keyof IpcChannel]: IpcChannel[K] extends string
    ? K
    : IpcChannel[K] extends object
    ? {
        [P in keyof IpcChannel[K]]: IpcChannel[K][P] extends string
          ? `${K & string}:${P & string}`
          : IpcChannel[K][P] extends object
          ? {
              [Q in keyof IpcChannel[K][P]]: `${K & string}:${P & string}:${Q & string}`;
            }[keyof IpcChannel[K][P]]
          : never;
      }[keyof IpcChannel[K]]
    : never;
}[keyof IpcChannel];

export type IpcHandler<T = any> = (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<T>;

export interface IpcHandlerMap {
  [key: string]: IpcHandler;
}

export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
