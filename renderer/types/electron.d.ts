import { IpcRenderer, ReportsApi, UsersApi, ContractsApi, AuthApi, StatisticsApi, LicenseAPI, DocumentsApi, UpdateApi, FileApi, SupplementsApi, NotificationsAPI, EmailApi } from "@/api";

declare global {
  interface Window {
    electron: {
      ipcRenderer: IpcRenderer;
      reports: ReportsApi;
      users: UsersApi;
      contracts: ContractsApi;
      auth: AuthApi;
      statistics: StatisticsApi;
      licenses: LicenseAPI;
      documents: DocumentsApi;
      updates: UpdateApi;
      files: FileApi;
      supplements: SupplementsApi;
      notifications: NotificationsAPI;
      email: EmailApi;
    };
  }
}

// Tipos de IPC
export interface IpcRenderer {
  invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>;
  on: (channel: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (channel: string, listener: (...args: unknown[]) => void) => void;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  data: User[];
}

export interface Supplement {
  id: string;
  contractId: string;
  field: string;
  oldValue: string;
  newValue: string;
  description: string;
  createdAt: string;
  fileName?: string;
}

export interface SupplementsResponse {
  success: boolean;
  data: Supplement[];
  error?: {
    message: string;
    code?: string;
  };
}

export interface SupplementsAPI {
  export: (supplementId: string, filePath: string) => Promise<SupplementsResponse>;
}

export interface FileDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: string[];
  message?: string;
}

export interface FileDialogResult {
  canceled: boolean;
  filePaths: string[];
  filePath?: string;
}

export interface ElectronFiles {
  open: (options: FileDialogOptions) => Promise<FileDialogResult | null>;
  save: (options: FileDialogOptions) => Promise<FileDialogResult | null>;
}

export interface NotificationOptions {
  title: string;
  body: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  description?: string;
  silent?: boolean;
}

export interface NotificationsAPI {
  show: (options: NotificationOptions) => Promise<void>;
}

// Tipos para configuración de correo
export interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  security: 'tls' | 'ssl' | 'none';
  isEnabled?: boolean;
  lastTested?: string;
  lastError?: string;
}

// Tipos para autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthAPI {
  login: (credentials: LoginCredentials) => Promise<ApiResponse<AuthResponse>>;
  logout: () => Promise<ApiResponse<boolean>>;
  verify: (token: string) => Promise<ApiResponse<{ user: User }>>;
  refresh: (refreshToken: string) => Promise<ApiResponse<AuthResponse>>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<ApiResponse<boolean>>;
  getProfile: () => Promise<ApiResponse<User>>;
}

// Tipos para usuarios
export interface UserFilters {
  search?: string;
  isActive?: boolean;
  role?: string;
  page?: number;
  limit?: number;
}

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  roleId: string;
  isActive: boolean;
}

export interface UserUpdateData extends Partial<UserCreateData> {
  id: string;
  currentPassword?: string;
}

// Interfaz extendida de User con la relación a Role
export interface UserWithRole extends User {
  role: Role;
}

export interface UsersAPI {
  list: (filters?: UserFilters) => Promise<ApiResponse<{ users: User[]; total: number }>>;
  create: (userData: UserCreateData) => Promise<ApiResponse<User>>;
  update: (userData: UserUpdateData) => Promise<ApiResponse<User>>;
  delete: (userId: string) => Promise<ApiResponse<boolean>>;
  toggleActive: (userId: string) => Promise<ApiResponse<boolean>>;
  changePassword: (userId: string, data: { currentPassword: string; newPassword: string }) => Promise<ApiResponse<boolean>>;
  getUserProfile: () => Promise<ApiResponse<UserWithRole>>;
  getById: (userId: string) => Promise<ApiResponse<UserWithRole>>;
}

export interface ElectronAPI {
  files: ElectronFiles;
  ipcRenderer: IpcRenderer;
  documents: {
    getByContract: (id: string) => Promise<Document>;
  };
  app: {
    onUpdateAvailable: (callback: () => void) => void;
    removeUpdateListener: (callback: () => void) => void;
    restart: () => Promise<void>;
  };
  statistics: {
    dashboard: () => Promise<StatisticsDashboard>;
  };
  notifications: NotificationsAPI;
  auth: AuthAPI;
  users: UsersAPI;
}

export interface License {
  id: string;
  licenseNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  licenseType: string;
  issueDate: string;
  expiryDate: string;
  signature: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseStatus {
  valid: boolean;
  type: string;
  expiryDate: string;
  features: string[];
  licenseNumber?: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  licenseType?: string;
  issueDate?: string;
  signature?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Extender la interfaz Window para incluir electron
declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

// Actualizar la interfaz ElectronAPI con los métodos de licencias
export interface LicenseAPI {
  validateLicense: (licenseData: string) => Promise<ApiResponse<License>>;
  getLicenseStatus: () => Promise<ApiResponse<LicenseStatus>>;
  revokeLicense: (licenseNumber: string) => Promise<ApiResponse<boolean>>;
  listLicenses: () => Promise<ApiResponse<License[]>>;
  getLicenseInfo: (licenseNumber: string) => Promise<ApiResponse<License>>;
}

export interface ElectronAPI {
  files: ElectronFiles;
  ipcRenderer: IpcRenderer;
  documents: {
    getByContract: (id: string) => Promise<Document>;
  };
  app: {
    onUpdateAvailable: (callback: () => void) => void;
    removeUpdateListener: (callback: () => void) => void;
    restart: () => Promise<void>;
  };
  statistics: {
    dashboard: () => Promise<StatisticsDashboard>;
  };
  notifications: NotificationsAPI;
  auth: AuthAPI;
  users: UsersAPI;
  license: LicenseAPI;
}

