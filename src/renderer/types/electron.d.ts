export interface ElectronAPI {
  auth: {
    login: (credentials: any) => Promise<any>;
    register: (userData: any) => Promise<any>;
    logout: () => Promise<void>;
    verifyToken: () => Promise<any>;
    updateProfile: (userData: any) => Promise<void>;
  };
  contracts: {
    getAll: (filters?: any) => Promise<any>;
    getById: (id: string) => Promise<any>;
    create: (contractData: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
    uploadDocument: (data: { filePath: string; contractId: string }) => Promise<string>;
  };
  statistics: {
    getPublic: () => Promise<any>;
    getPrivate: () => Promise<any>;
    exportReport: (data: any) => Promise<any>;
  };
  files: {
    select: (options?: { filters?: Array<{ name: string; extensions: string[] }> }) => Promise<string>;
    open: (filePath: string) => Promise<void>;
  };
  invoke: (channel: string, data?: any) => Promise<any>;
  on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};