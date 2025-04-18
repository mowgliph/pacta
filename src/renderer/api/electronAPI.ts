import { Contract, ContractFilters, Supplement } from '../types/contracts';

interface User {
  id: string;
  name: string;
  role: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
  message?: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from: string;
  enabled: boolean;
}

export interface AppConfig {
  enableLandingPage: boolean;
  enablePublicDashboard: boolean;
}

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, data?: any) => Promise<any>;
      on: (channel: string, callback: (event: any, data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    }
  }
}

export class ElectronAPI {
  private static instance: ElectronAPI;
  
  private constructor() {}

  static getInstance(): ElectronAPI {
    if (!ElectronAPI.instance) {
      ElectronAPI.instance = new ElectronAPI();
    }
    return ElectronAPI.instance;
  }

  private async invoke<T>(channel: string, data?: any): Promise<T> {
    if (!window.electronAPI?.invoke) {
      throw new Error('API de Electron no disponible');
    }
    return window.electronAPI.invoke(channel, data);
  }

  // Auth methods
  auth = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      return this.invoke('auth:login', credentials);
    },
    register: async (userData: any): Promise<any> => {
      return this.invoke('auth:register', userData);
    },
    updateProfile: async (userData: Partial<User>): Promise<void> => {
      return this.invoke('profile:update', userData);
    },
    logout: async (): Promise<void> => {
      return this.invoke('auth:logout');
    },
    verifyToken: async (): Promise<any> => {
      return this.invoke('auth:verify');
    }
  };

  // Contract methods
  contracts = {
    getAll: async (filters?: ContractFilters): Promise<Contract[]> => {
      return this.invoke('contracts:getAll', filters);
    },
    getById: async (id: string): Promise<Contract> => {
      return this.invoke('contracts:getById', id);
    },
    create: async (contractData: Partial<Contract>): Promise<Contract> => {
      return this.invoke('contracts:create', contractData);
    },
    update: async (id: string, data: Partial<Contract>): Promise<Contract> => {
      return this.invoke('contracts:update', { id, data });
    },
    delete: async (id: string): Promise<boolean> => {
      return this.invoke('contracts:delete', id);
    },
    uploadDocument: async (data: { filePath: string; contractId: string }): Promise<string> => {
      return this.invoke('contracts:uploadDocument', data);
    }
  };

  // Supplement methods
  supplements = {
    add: async (contractId: string, data: Partial<Supplement>): Promise<Supplement> => {
      return this.invoke('supplements:add', { contractId, data });
    },
    update: async (contractId: string, supplementId: string, data: Partial<Supplement>): Promise<Supplement> => {
      return this.invoke('supplements:update', { contractId, supplementId, data });
    },
    getDetails: async (contractId: string, supplementId: string): Promise<Supplement> => {
      return this.invoke('supplements:getDetails', { contractId, supplementId });
    },
    delete: async (contractId: string, supplementId: string): Promise<boolean> => {
      return this.invoke('supplements:delete', { contractId, supplementId });
    },
    uploadDocument: async (data: { filePath: string; supplementId: string }): Promise<string> => {
      return this.invoke('supplements:uploadDocument', data);
    }
  };

  // Statistics methods
  statistics = {
    getPublic: async (): Promise<any> => {
      return this.invoke('statistics:getPublic');
    },
    getPrivate: async (): Promise<any> => {
      return this.invoke('statistics:getPrivate');
    },
    exportReport: async (data: any): Promise<any> => {
      return this.invoke('statistics:exportReport', data);
    }
  };

  // File methods
  files = {
    select: async (options?: { filters?: Array<{ name: string; extensions: string[] }> }): Promise<string> => {
      return this.invoke('files:select', options);
    },
    open: async (filePath: string): Promise<void> => {
      return this.invoke('files:open', filePath);
    }
  };

  // SMTP methods
  smtp = {
    getConfig: async (): Promise<SMTPConfig> => {
      return this.invoke('smtp:getConfig');
    },
    updateConfig: async (config: SMTPConfig): Promise<SMTPConfig> => {
      return this.invoke('smtp:updateConfig', config);
    },
    testConnection: async (config: SMTPConfig): Promise<{success: boolean; message: string}> => {
      return this.invoke('smtp:testConnection', config);
    }
  };

  // Application settings methods
  settings = {
    getAppConfig: async (): Promise<AppConfig> => {
      return this.invoke('settings:getAppConfig');
    },
    updateAppConfig: async (config: AppConfig): Promise<AppConfig> => {
      return this.invoke('settings:updateAppConfig', config);
    }
  };

  // Notifications methods
  notification = {
    send: async (channel: string, data: any): Promise<void> => {
      return this.invoke('notification:send', { channel, data });
    },
    subscribe: async (channel: string): Promise<void> => {
      return this.invoke('notification:subscribe', channel);
    },
    unsubscribe: async (channel: string): Promise<void> => {
      return this.invoke('notification:unsubscribe', channel);
    }
  };

  // Events methods
  events = {
    on: (channel: string, callback: (event: any, data: any) => void): void => {
      window.electronAPI.on(channel, callback);
    },
    removeAllListeners: (channel: string): void => {
      window.electronAPI.removeAllListeners(channel);
    }
  };
}

// Exportar una instancia única
export const electronAPI = ElectronAPI.getInstance();

