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
  id: string;
  email: string;
  name: string;
  role?: UserRole;
  token?: string;
  expiresAt?: string;
}

// Datos de un rol de usuario
export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[] | Record<string, any>;
}

// ====================================================================
// Usuarios
// ====================================================================

export interface UserBasic {
  id: string;
  name: string;
  email: string;
}

// Filtros para usuarios
export interface UserFilters {
  search?: string;
  roleId?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

// Solicitud para crear usuario
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
  customPermissions?: string;
}

// Solicitud para actualizar usuario
export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
  customPermissions?: string;
}

// Solicitud para cambiar contraseña
export interface ChangePasswordRequest {
  id: string;
  currentPassword: string;
  newPassword: string;
}

// Solicitud para restablecer contraseña
export interface ResetPasswordRequest {
  email: string;
}

// Respuesta de lista de usuarios
export interface UsersListResponse {
  users: UserSession[];
  total: number;
  page: number;
  limit: number;
}

// ====================================================================
// Contratos
// ====================================================================

// Información básica de un contrato
export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  description?: string;
  parties: string;
  startDate: Date;
  endDate?: Date;
  value?: string;
  amount?: number;
  status: string;
  documentUrl?: string;
  type: string;
  companyName: string;
  companyAddress?: string;
  signDate: Date;
  signPlace?: string;
  paymentMethod?: string;
  paymentTerm?: string;
  isRestricted: boolean;
  createdById: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: UserBasic;
  owner?: UserBasic;
}

// Filtros para contratos
export interface ContractFilters {
  status?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  ownerId?: string;
  page?: number;
  limit?: number;
}

// Solicitud para crear contrato
export interface CreateContractRequest {
  contractNumber: string;
  title: string;
  description?: string;
  parties: string;
  startDate: Date;
  endDate?: Date;
  value?: string;
  amount?: number;
  status: string;
  documentUrl?: string;
  type: string;
  companyName: string;
  companyAddress?: string;
  signDate: Date;
  signPlace?: string;
  paymentMethod?: string;
  paymentTerm?: string;
  isRestricted?: boolean;
  ownerId: string;
}

// Solicitud para actualizar contrato
export interface UpdateContractRequest {
  id: string;
  contractNumber?: string;
  title?: string;
  description?: string;
  parties?: string;
  startDate?: Date;
  endDate?: Date;
  value?: string;
  amount?: number;
  status?: string;
  documentUrl?: string;
  type?: string;
  companyName?: string;
  companyAddress?: string;
  signDate?: Date;
  signPlace?: string;
  paymentMethod?: string;
  paymentTerm?: string;
  isRestricted?: boolean;
  ownerId?: string;
}

// Respuesta de lista de contratos
export interface ContractsListResponse {
  contracts: Contract[];
  total: number;
  page: number;
  limit: number;
}

// ====================================================================
// Suplementos
// ====================================================================

// Información de un suplemento
export interface Supplement {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  documentUrl?: string;
  changes: string;
  effectiveDate: Date;
  isApproved: boolean;
  approvedById?: string;
  approvedAt?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: UserBasic;
  createdBy?: UserBasic;
}

// Solicitud para crear suplemento
export interface CreateSupplementRequest {
  contractId: string;
  title: string;
  description?: string;
  documentUrl?: string;
  changes: string;
  effectiveDate: Date;
}

// Solicitud para actualizar suplemento
export interface UpdateSupplementRequest {
  id: string;
  title?: string;
  description?: string;
  documentUrl?: string;
  changes?: string;
  effectiveDate?: Date;
}

// Solicitud para aprobar suplemento
export interface ApproveSupplementRequest {
  id: string;
  approve: boolean;
}

// ====================================================================
// Documentos
// ====================================================================

// Información de un documento
export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  contractId?: string;
  supplementId?: string;
  uploadedById: string;
  description?: string;
  tags?: string;
  isPublic: boolean;
  uploadedAt: Date;
  updatedAt: Date;
  downloads: number;
  views: number;
  uploadedBy?: UserBasic;
}

// Filtros para documentos
export interface DocumentFilters {
  contractId?: string;
  supplementId?: string;
  mimeType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Solicitud para actualizar metadatos de documento
export interface UpdateDocumentMetadataRequest {
  id: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

// Respuesta de lista de documentos
export interface DocumentsListResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
}

// ====================================================================
// Notificaciones
// ====================================================================

// Información de una notificación
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  contractId?: string;
  createdAt: Date;
  readAt?: Date;
}

// Filtros para notificaciones
export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

// Solicitud para marcar notificación como leída
export interface MarkNotificationReadRequest {
  id: string;
  userId: string;
}

// Solicitud para crear notificación
export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: string;
  contractId?: string;
}

// Respuesta de lista de notificaciones
export interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

// ====================================================================
// Configuración
// ====================================================================

// Preferencias de usuario
export interface UserPreference {
  id: string;
  userId: string;
  theme: string;
  notificationsEnabled: boolean;
  notificationDays: number;
}

// Configuración de correo electrónico
export interface EmailConfig {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  from: string;
  enabled: boolean;
}

// Configuración del sistema
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

// Solicitud para actualizar preferencias de usuario
export interface UpdateUserPreferenceRequest {
  userId: string;
  theme?: string;
  notificationsEnabled?: boolean;
  notificationDays?: number;
}

// Solicitud para actualizar configuración de correo
export interface UpdateEmailConfigRequest {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  secure?: boolean;
  from?: string;
  enabled?: boolean;
}

// Solicitud para actualizar configuración del sistema
export interface UpdateSystemSettingRequest {
  key: string;
  value: string;
  category?: string;
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
