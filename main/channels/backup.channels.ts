/**
 * Canales IPC relacionados con copias de seguridad
 */

/**
 * Enumera los canales IPC para backups
 */
export enum BackupChannels {
  GET_ALL = "backup:getAll",
  CREATE = "backup:create",
  RESTORE = "backup:restore",
  DELETE = "backup:delete",
  CLEAN_OLD = "backup:cleanOld",
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
  [BackupChannels.GET_ALL]: {
    request: void;
    response: BackupsListResponse;
  };
  [BackupChannels.CREATE]: {
    request: CreateBackupRequest;
    response: BackupResponse;
  };
  [BackupChannels.RESTORE]: {
    request: RestoreBackupRequest;
    response: { success: boolean; message?: string };
  };
  [BackupChannels.DELETE]: {
    request: DeleteBackupRequest;
    response: { success: boolean; message?: string };
  };
  [BackupChannels.CLEAN_OLD]: {
    request: void;
    response: { success: boolean; message: string };
  };
}
