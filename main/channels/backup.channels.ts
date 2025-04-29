/**
 * Canales IPC relacionados con copias de seguridad
 */
import { 
  BackupResponse,
  BackupsListResponse,
  CreateBackupRequest,
  DeleteBackupRequest,
  RestoreBackupRequest
} from '../../shared/types';

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