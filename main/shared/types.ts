/**
 * Tipos compartidos entre el proceso principal y el proceso de renderizado
 * Esta estructura permite mantener la coherencia de tipos en toda la aplicación
 */

// Respuesta genérica de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

// ====================================================================
// Autenticación
// ====================================================================

// Tipos de credenciales para autenticación
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Resultado de autenticación
export interface AuthResult {
  success: boolean;
  user?: UserSession;
  token?: string;
  message?: string;
}

// Información del usuario autenticado
export interface UserSession {
  id: number;
  email: string;
  name: string;
  role?: UserRole;
}

// Datos de un rol de usuario
export interface UserRole {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}

// ====================================================================
// Usuarios
// ====================================================================

export interface UserBasic {
  id: number;
  name: string;
  email: string;
}

// Filtros para usuarios
export interface UserFilters {
  search?: string;
  roleId?: number;
  active?: boolean;
}

// ====================================================================
// Contratos
// ====================================================================

// Información básica de un contrato
export interface Contract {
  id: number;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
  createdBy?: UserBasic;
  users?: UserBasic[];
}

// Filtros para contratos
export interface ContractFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

// ====================================================================
// Documentos
// ====================================================================

// Información de un documento
export interface Document {
  id: number;
  name: string;
  description?: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  contractId: number;
  createdAt: Date;
  updatedAt: Date;
  createdById: number;
  createdBy?: UserBasic;
}

// Filtros para documentos
export interface DocumentFilters {
  contractId?: number;
  fileType?: string;
  search?: string;
}

// ====================================================================
// Backups
// ====================================================================

// Información de un backup
export interface Backup {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  note?: string;
  isAutomatic: boolean;
  createdAt: Date;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

// Solicitud para crear backup
export interface CreateBackupRequest {
  userId: string;
  note?: string;
}

// Solicitud para restaurar backup
export interface RestoreBackupRequest {
  backupId: string;
  userId: string;
}

// Solicitud para eliminar backup
export interface DeleteBackupRequest {
  backupId: string;
}

// Respuesta de operación de backup
export interface BackupResponse {
  success: boolean;
  backup?: Backup;
  message?: string;
}

// Respuesta con lista de backups
export interface BackupsListResponse {
  backups: Backup[];
}

// ====================================================================

// Tipos claros para los mensajes IPC
export interface IpcRequest<T = any> {
  id: string;
  channel: string;
  data: T;
}

export interface IpcResponse<T = any> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
}

export enum IpcChannels {
  // Canales de aplicación
  APP_RELAUNCH = "app:relaunch",
  APP_EXIT = "app:exit",
  APP_VERSION = "app:getVersion",
  APP_PATH = "app:getPath",
  APP_MINIMIZE = "app:minimize",
  APP_MAXIMIZE = "app:maximize",
  APP_QUIT = "app:quit",

  // Canales de documentos
  DOCUMENTS_OPEN = "documents:open",
  DOCUMENTS_SAVE = "documents:save",

  // Canales de backups
  BACKUPS_GET_ALL = "backup:getAll",
  BACKUPS_CREATE = "backup:create",
  BACKUPS_RESTORE = "backup:restore",
  BACKUPS_DELETE = "backup:delete",
  BACKUPS_CLEAN_OLD = "backup:cleanOld",

  // Canales de notificaciones
  NOTIFICATIONS_SHOW = "notifications:show",
}

// Definición de interfaces tipadas para todas las operaciones IPC
export interface IpcChannelMap {
  // Canales de backups
  [IpcChannels.BACKUPS_GET_ALL]: {
    request: void;
    response: BackupsListResponse;
  };
  [IpcChannels.BACKUPS_CREATE]: {
    request: CreateBackupRequest;
    response: BackupResponse;
  };
  [IpcChannels.BACKUPS_RESTORE]: {
    request: RestoreBackupRequest;
    response: { success: boolean; message?: string };
  };
  [IpcChannels.BACKUPS_DELETE]: {
    request: DeleteBackupRequest;
    response: { success: boolean; message?: string };
  };
  [IpcChannels.BACKUPS_CLEAN_OLD]: {
    request: void;
    response: { success: boolean; message: string };
  };
}
