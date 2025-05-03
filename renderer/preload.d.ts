import { IpcHandler } from "../main/preload";

declare global {
  interface Window {
    Electron: {
      contracts: {
        list: (filters?: any) => Promise<any>;
        create: (data: any) => Promise<any>;
        update: (id: string, data: any) => Promise<any>;
        delete: (id: string) => Promise<any>;
        export: (id: string) => Promise<any>;
        upload: (file: any) => Promise<any>;
        archive: (id: string) => Promise<any>;
        updateAccessControl: (id: string, data: any) => Promise<any>;
        assignUsers: (id: string, users: any) => Promise<any>;
        getById: (id: string) => Promise<any>;
      };
      supplements: {
        list: (contractId: string) => Promise<any>;
        create: (contractId: string, data: any) => Promise<any>;
        update: (id: string, data: any) => Promise<any>;
        delete: (id: string) => Promise<any>;
        export: (id: string) => Promise<any>;
        upload: (file: any) => Promise<any>;
      };
      documents: {
        list: (filters?: any) => Promise<any>;
        upload: (file: any) => Promise<any>;
        delete: (id: string) => Promise<any>;
        download: (id: string) => Promise<any>;
        getByContract: (contractId: string) => Promise<any>;
        getBySupplement: (supplementId: string) => Promise<any>;
        open: (id: string) => Promise<any>;
      };
      users: {
        list: () => Promise<any>;
        create: (userData: any) => Promise<any>;
        update: (userData: any) => Promise<any>;
        delete: (id: string) => Promise<any>;
        toggleActive: (id: string) => Promise<any>;
        changePassword: (data: any) => Promise<any>;
        getById: (id: string) => Promise<any>;
      };
      roles: {
        list: () => Promise<any>;
        create: (data: any) => Promise<any>;
        update: (data: any) => Promise<any>;
        delete: (id: string) => Promise<any>;
      };
      statistics: {
        dashboard: () => Promise<any>;
        contracts: (filters?: any) => Promise<any>;
        export: (type: string, filters?: any) => Promise<any>;
      };
      system: {
        openFile: (path: string) => Promise<any>;
        saveFile: (path: string, content: any) => Promise<any>;
        backup: () => Promise<any>;
        restore: (backupId: string) => Promise<any>;
        settings: {
          get: (key: string) => Promise<any>;
          update: (key: string, value: any) => Promise<any>;
        };
      };
      notifications: {
        show: (options: { title: string; body: string }) => Promise<any>;
        clear: (id: string) => Promise<any>;
        markRead: (id: string) => Promise<any>;
        getUnread: () => Promise<any>;
      };
      backups: {
        create: (description?: string) => Promise<any>;
        restore: (id: string) => Promise<any>;
        delete: (id: string) => Promise<any>;
        list: () => Promise<any>;
        cleanOld: () => Promise<any>;
      };
      theme: {
        getSystemTheme: () => Promise<"light" | "dark">;
        setAppTheme: (theme: "light" | "dark" | "system") => Promise<void>;
      };
      api: {
        request: (req: {
          method: string;
          endpoint: string;
          data?: any;
          params?: any;
        }) => Promise<any>;
      };
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, listener: (...args: any[]) => void) => void;
        removeListener: (
          channel: string,
          listener: (...args: any[]) => void
        ) => void;
      };
    };
  }
}

interface DashboardAPI {
  getStatistics: () => Promise<{
    success: boolean;
    data?: {
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
        id: string;
        title: string;
        contractNumber: string;
        updatedAt: Date;
        createdBy: {
          name: string;
        };
      }>;
    };
    error?: string;
  }>;

  getTrends: () => Promise<{
    success: boolean;
    data?: {
      [key: string]: {
        total: number;
        client: number;
        supplier: number;
        active: number;
        expired: number;
      };
    };
    error?: string;
  }>;

  getUpcomingActions: () => Promise<{
    success: boolean;
    data?: {
      upcomingContracts: Array<{
        id: string;
        title: string;
        contractNumber: string;
        endDate: Date;
        owner: {
          name: string;
          email: string;
        };
      }>;
      pendingSupplements: Array<{
        id: string;
        description: string;
        createdAt: Date;
        contract: {
          title: string;
          contractNumber: string;
        };
        createdBy: {
          name: string;
        };
      }>;
    };
    error?: string;
  }>;
}
