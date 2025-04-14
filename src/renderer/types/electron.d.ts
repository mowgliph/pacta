export interface ElectronAPI {
  getVersions: () => {
    chrome: string;
    node: string;
    electron: string;
  };
  auth: {
    login: (credentials: any) => Promise<any>;
    register: (userData: any) => Promise<any>;
    logout: () => Promise<void>;
    verifyToken: () => Promise<any>;
  };
  contracts: {
    getAll: () => Promise<any>;
    getById: (id: number) => Promise<any>;
    create: (contractData: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
    uploadDocument: (contractId: number, filePath: string) => Promise<any>;
  };
  files: {
    select: (options?: any) => Promise<string>;
    save: (fileData: any) => Promise<any>;
    open: (filePath: string) => Promise<any>;
    getPdfPreview: (filePath: string) => Promise<any>;
  };
  notifications: {
    getAll: () => Promise<any>;
    markAsRead: (id: number) => Promise<any>;
    subscribe: (callback: (data: any) => void) => void;
    unsubscribe: () => void;
  };
  alerts: {
    getExpiringContracts: () => Promise<any>;
    getPendingReviews: () => Promise<any>;
    subscribe: (callback: (data: any) => void) => void;
    unsubscribe: () => void;
  };
  users: {
    getProfile: () => Promise<any>;
    updateProfile: (data: any) => Promise<any>;
    changePassword: (data: any) => Promise<any>;
  };
  system: {
    onError: (callback: (error: any) => void) => void;
    onUpdate: (callback: (data: any) => void) => void;
    clearListeners: () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}