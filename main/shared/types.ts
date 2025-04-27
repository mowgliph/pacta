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
  APP_RELAUNCH = "app:relaunch",
  APP_EXIT = "app:exit",
  APP_VERSION = "app:getVersion",
  APP_PATH = "app:getPath",

  DOCUMENTS_OPEN = "documents:open",
  DOCUMENTS_SAVE = "documents:save",

  BACKUPS_CREATE = "backups:create",
  BACKUPS_RESTORE = "backups:restore",
  BACKUPS_DELETE = "backups:delete",

  NOTIFICATIONS_SHOW = "notifications:show",
}
