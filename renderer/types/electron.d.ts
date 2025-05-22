export interface IpcRenderer {
  invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>;
  on: (channel: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (channel: string, listener: (...args: unknown[]) => void) => void;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface Document {
  success: boolean;
  data: any[];
}

export interface RecentActivity {
  id: string;
  type: 'new' | 'updated' | 'expired';
  date: string;
  description: string;
  name: string;
}

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
    recentActivity: RecentActivity[];
  };
}

import type { IpcResponse } from "./handleIpcResponse";

export interface StatisticsContracts {
  success: boolean;
  data: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
  };
}

export interface StatisticsByCurrency {
  success: boolean;
  data: Array<{
    currency: string;
    count: number;
  }>;
}

export interface StatisticsByUser {
  success: boolean;
  data: Array<{
    user: string;
    count: number;
  }>;
}

export interface StatisticsByMonth {
  success: boolean;
  data: Array<{
    month: string;
    count: number;
  }>;
}

export interface StatisticsSupplements {
  success: boolean;
  data: Array<{
    contractId: string;
    count: number;
  }>;
}

export interface StatisticsUsersActivity {
  success: boolean;
  data: Array<{
    user: string;
    lastActivity: string;
    actions: number;
  }>;
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
}

declare global {
  interface Window {
    Electron?: {
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
      files: ElectronFiles;
      notifications: NotificationsAPI;
      supplements: SupplementsAPI;
    };
  }
}

export {};
