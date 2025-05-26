import { IpcRenderer } from 'electron';

// Tipos comunes
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    context?: {
      [key: string]: any;
    };
  };
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Tipos de usuario
export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRole extends User {
  role: Role;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

// Tipos de contrato
export interface StatisticsDashboard {
  success: boolean;
  data: {
    totals: {
      total: number;
      active: number;
      expiring: number;
      expired: number;
    };
    distribution: {
      client: number;
      supplier: number;
    };
    recentActivity: Array<{
      title: string;
      date: string;
      description: string;
    }>;
  };
}

export interface Contract {
  id: string;
  // Agregar otros campos según corresponda
}

export interface ContractCreateData {
  // Campos necesarios para crear un contrato
}

export interface ContractUpdateData {
  id: string;
  // Campos actualizables del contrato
}

// Tipos de suplementos
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

// Tipos de documentos
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
}

// Tipos de licencia
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

// Tipos de notificaciones
export interface NotificationOptions {
  title: string;
  body: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  description?: string;
  silent?: boolean;
}

// Tipos para diálogos de archivo
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


// Definición de las APIs
export interface ReportsApi {
  exportPDF: (data: any, template: string) => Promise<ApiResponse<string>>;
  exportExcel: (data: any, template: string) => Promise<ApiResponse<string>>;
  getTemplates: () => Promise<ApiResponse<string[]>>;
  saveTemplate: (name: string, content: any) => Promise<ApiResponse<void>>;
  deleteTemplate: (name: string) => Promise<ApiResponse<void>>;
}

export interface LicenseApi {
  validateLicense: (licenseData: any) => Promise<ApiResponse<License>>;
  getLicenseStatus: () => Promise<ApiResponse<LicenseStatus>>;
  revokeLicense: (licenseNumber: string) => Promise<ApiResponse<boolean>>;
  listLicenses: () => Promise<ApiResponse<License[]>>;
  getLicenseInfo: (licenseNumber: string) => Promise<ApiResponse<License>>;
}

export interface AuthApi {
  login: (credentials: { email: string; password: string }) => Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>>;
  logout: () => Promise<ApiResponse<boolean>>;
  verify: (token: string) => Promise<ApiResponse<{ user: User }>>;
  refresh: (refreshToken: string) => Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<ApiResponse<boolean>>;
  getProfile: () => Promise<ApiResponse<User>>;
}

export interface ContractFilters {
  type?: 'Cliente' | 'Proveedor';
  status?: string;
  search?: string;
  // Agregar más filtros según sea necesario
}

export interface ContractsApi {
  list: (filters?: ContractFilters) => Promise<ApiResponse<PaginationResponse<Contract>>>;
  create: (data: ContractCreateData) => Promise<ApiResponse<Contract>>;
  update: (id: string, data: Partial<ContractUpdateData>) => Promise<ApiResponse<Contract>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  export: (id: string) => Promise<ApiResponse<string>>;
  upload: (file: File) => Promise<ApiResponse<string>>;
  archive: (id: string) => Promise<ApiResponse<void>>;
  updateAccessControl: (id: string, data: any) => Promise<ApiResponse<void>>;
  assignUsers: (id: string, users: string[]) => Promise<ApiResponse<void>>;
  getById: (id: string) => Promise<ApiResponse<Contract>>;
}

export interface SupplementsApi {
  list: (contractId: string) => Promise<ApiResponse<Supplement[]>>;
  create: (contractId: string, data: Partial<Omit<Supplement, 'id' | 'contractId' | 'createdAt'>>) => Promise<ApiResponse<Supplement>>;
  update: (id: string, data: Partial<Omit<Supplement, 'id' | 'contractId' | 'createdAt'>>) => Promise<ApiResponse<Supplement>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  export: (id: string) => Promise<ApiResponse<string>>;
  upload: (file: File) => Promise<ApiResponse<string>>;
}

export interface DocumentsApi {
  list: (filters?: any) => Promise<ApiResponse<Document[]>>;
  upload: (file: File) => Promise<ApiResponse<Document>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  download: (id: string) => Promise<ApiResponse<string>>;
  getByContract: (contractId: string) => Promise<ApiResponse<Document[]>>;
  getBySupplement: (supplementId: string) => Promise<ApiResponse<Document[]>>;
  open: (id: string) => Promise<ApiResponse<void>>;
}

export interface UsersApi {
  list: (filters?: any) => Promise<ApiResponse<{ users: User[]; total: number }>>;
  create: (userData: any) => Promise<ApiResponse<User>>;
  update: (userData: any) => Promise<ApiResponse<User>>;
  delete: (id: string) => Promise<ApiResponse<boolean>>;
  toggleActive: (id: string) => Promise<ApiResponse<boolean>>;
  changePassword: (data: { userId: string; currentPassword: string; newPassword: string }) => Promise<ApiResponse<boolean>>;
  getById: (id: string) => Promise<ApiResponse<UserWithRole>>;
  getUserProfile: () => Promise<ApiResponse<UserWithRole>>;
}

export interface RolesApi {
  list: () => Promise<ApiResponse<Role[]>>;
  create: (data: Omit<Role, 'id'>) => Promise<ApiResponse<Role>>;
  update: (data: Role) => Promise<ApiResponse<Role>>;
  delete: (id: string) => Promise<ApiResponse<boolean>>;
}

export interface StatisticsApi {
  dashboard: () => Promise<ApiResponse<any>>;
  contracts: (filters?: any) => Promise<ApiResponse<any>>;
  export: (type: string, filters?: any) => Promise<ApiResponse<string>>;
  contractsByStatus: () => Promise<ApiResponse<any>>;
  contractsByType: () => Promise<ApiResponse<any>>;
  contractsByCurrency: () => Promise<ApiResponse<any>>;
  contractsByUser: () => Promise<ApiResponse<any>>;
  contractsCreatedByMonth: () => Promise<ApiResponse<any>>;
  contractsExpiredByMonth: () => Promise<ApiResponse<any>>;
  supplementsCountByContract: () => Promise<ApiResponse<any>>;
}

export interface SystemApi {
  openFile: (path: string) => Promise<ApiResponse<void>>;
  saveFile: (path: string, content: string) => Promise<ApiResponse<void>>;
  backup: () => Promise<ApiResponse<string>>;
  restore: (backupId: string) => Promise<ApiResponse<void>>;
  settings: {
    get: (key: string) => Promise<ApiResponse<any>>;
    update: (key: string, value: any) => Promise<ApiResponse<void>>;
  };
}

export interface NotificationsApi {
  show: (options: NotificationOptions) => Promise<ApiResponse<void>>;
  clear: (id: string) => Promise<ApiResponse<void>>;
  markRead: (id: string) => Promise<ApiResponse<void>>;
  getUnread: () => Promise<ApiResponse<any[]>>;
}

export interface BackupsApi {
  create: (description: string) => Promise<ApiResponse<string>>;
  restore: (id: string) => Promise<ApiResponse<void>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  list: () => Promise<ApiResponse<any[]>>;
  cleanOld: () => Promise<ApiResponse<void>>;
}

export interface ThemeApi {
  getSystemTheme: () => Promise<ApiResponse<string>>;
  getSavedTheme: () => Promise<ApiResponse<string>>;
  setAppTheme: (theme: string) => Promise<ApiResponse<void>>;
  onSystemThemeChange: (callback: (theme: string) => void) => void;
  removeSystemThemeListener: (callback: (theme: string) => void) => void;
}

export interface IpcRenderer {
  invoke(channel: string, ...args: any[]): Promise<any>;
  on(channel: string, listener: (...args: any[]) => void): void;
  removeListener(channel: string, listener: (...args: any[]) => void): void;
}

export interface App {
  onUpdateAvailable: (callback: () => void) => void;
  removeUpdateListener: (callback: () => void) => void;
  restart: () => Promise<void>;
}

export interface GenericApi {
  request: (req: any) => Promise<ApiResponse<any>>;
}

// Extender la interfaz Window para incluir electron
declare global {
  interface Window {
    electron: {
      ipcRenderer: IpcRenderer;
      app: App;
      auth: AuthApi;
      contracts: ContractsApi;
      documents: DocumentsApi;
      notifications: NotificationsApi;
      reports: ReportsApi;
      roles: RolesApi;
      statistics: StatisticsApi;
      supplements: SupplementsApi;
      system: SystemApi;
      users: UsersApi;
      backups: BackupsApi;
      theme: ThemeApi;
      api: GenericApi;
    };
  }
}