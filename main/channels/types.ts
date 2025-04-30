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
