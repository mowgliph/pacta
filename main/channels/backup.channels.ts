/**
 * Canales IPC relacionados con copias de seguridad
 */

import { Backup } from "../models/backup.model";

/**
 * Enumera los canales IPC para backups
 */
export enum BackupChannels {
  GET_ALL = "backup:get-all",
  CREATE = "backup:create",
  RESTORE = "backup:restore",
  DELETE = "backup:delete",
  CLEAN_OLD = "backup:clean-old",
}

/**
 * Tipos de solicitudes relacionadas con backups
 */
export type CreateBackupRequest = {
  description?: string;
  userId?: string;
};

export type RestoreBackupRequest = {
  backupId: string;
  userId?: string;
};

export type DeleteBackupRequest = {
  backupId: string;
};

export type BackupResponse = {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: string | number;
  createdAt: string;
  createdById: string;
  note?: string;
  isAutomatic: boolean;
  createdBy?: {
    name: string;
    email: string;
  };
  formattedDate?: string;
  canDelete?: boolean;
};

export type BackupsListResponse = BackupResponse[];

/**
 * Interfaz para solicitudes relacionadas con backups
 */
export interface BackupRequests {
  GET_ALL: {
    request: void;
    response: {
      success: boolean;
      data?: Backup[];
      error?: string;
    };
  };
  CREATE: {
    request: {
      description?: string;
      userId?: string;
    };
    response: {
      success: boolean;
      data?: Backup;
      error?: string;
    };
  };
  RESTORE: {
    request: {
      backupId: string;
      userId?: string;
    };
    response: {
      success: boolean;
      data?: boolean;
      error?: string;
    };
  };
  DELETE: {
    request: {
      backupId: string;
    };
    response: {
      success: boolean;
      data?: boolean;
      error?: string;
    };
  };
  CLEAN_OLD: {
    request: void;
    response: {
      success: boolean;
      data?: number;
      error?: string;
    };
  };
}
