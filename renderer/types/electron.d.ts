declare global {
  interface Window {
    Electron?: {
      ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
        on: (channel: string, listener: (...args: unknown[]) => void) => void;
        removeListener: (
          channel: string,
          listener: (...args: unknown[]) => void
        ) => void;
      };
      app: {
        onUpdateAvailable: (callback: () => void) => void;
        removeUpdateListener: (callback: () => void) => void;
        restart: () => Promise<void>;
      };
      statistics: {
        dashboard: () => Promise<{
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
              id: string;
              title: string;
              contractNumber: string;
              updatedAt: string;
              createdBy: {
                name: string;
              };
            }>;
          };
        }>;
      };
    };
  }
}

export {};
