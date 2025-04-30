import { IpcHandler } from "../main/preload";

declare global {
  interface Window {
    Electron: {
      app: {
        relaunch: () => void;
        exit: (code: number) => void;
        getVersion: () => Promise<string>;
        getPath: (name: string) => Promise<string>;
        getInfo: () => Promise<any>;
      };

      auth: {
        login: (credentials: {
          usuario: string;
          password: string;
          rememberMe?: boolean;
          deviceId?: string;
          isSpecialUser?: boolean;
        }) => Promise<any>;
        logout: () => Promise<any>;
        getPerfil: () => Promise<any>;
        cambiarContrasena: (datos: {
          currentPassword: string;
          newPassword: string;
        }) => Promise<any>;
      };

      theme: {
        getSystemTheme: () => Promise<"light" | "dark">;
        setAppTheme: (theme: "light" | "dark" | "system") => Promise<void>;
      };

      users: {
        list: () => Promise<any[]>;
        getById: (id: string) => Promise<any>;
        create: (userData: any) => Promise<any>;
        update: (userData: any) => Promise<any>;
        toggleActive: (userId: string) => Promise<any>;
        changePassword: (passwordData: any) => Promise<any>;
      };

      roles: {
        getAll: () => Promise<any[]>;
      };

      contratos: {
        listar: (filtros?: any) => Promise<any[]>;
        crear: (datos: any) => Promise<any>;
        obtener: (id: string) => Promise<any>;
        actualizar: (id: string, datos: any) => Promise<any>;
        archivar: (id: string) => Promise<any>;
      };

      suplementos: {
        listar: (contratoId: string) => Promise<any[]>;
        crear: (contratoId: string, datos: any) => Promise<any>;
        obtener: (id: string) => Promise<any>;
      };

      documentos: {
        abrir: (path: string) => Promise<any>;
        guardar: (path: string, content: any) => Promise<any>;
        listar: (contratoId: string) => Promise<any[]>;
      };

      backups: {
        crear: (descripcion?: string) => Promise<any>;
        restaurar: (
          id: string
        ) => Promise<{ success: boolean; message?: string }>;
        eliminar: (
          id: string
        ) => Promise<{ success: boolean; message?: string }>;
        listar: () => Promise<
          Array<{
            id: string;
            fileName: string;
            filePath: string;
            fileSize: string | number;
            createdAt: string;
            createdById: string;
            note?: string;
            isAutomatic: boolean;
            createdBy?: {
              name: string;
              email: string;
            };
            formattedDate?: string;
            canDelete?: boolean;
          }>
        >;
        limpiarAntiguos: () => Promise<{ success: boolean; message: string }>;
      };

      notificaciones: {
        mostrar: (opciones: { titulo: string; cuerpo: string }) => Promise<any>;
        marcarLeida: (id: string) => Promise<any>;
        obtenerNoLeidas: () => Promise<any[]>;
      };

      estadisticas: {
        dashboard: () => Promise<any>;
        contratos: (filtros?: any) => Promise<any>;
        exportar: (tipo: string, filtros?: any) => Promise<any>;
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

      receive: (channel: string, callback: (...args: any[]) => void) => boolean;
      removeListener: (channel: string) => boolean;

      dashboard: DashboardAPI;
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
