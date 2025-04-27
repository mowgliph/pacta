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
          usuario: string, 
          password: string, 
          rememberMe?: boolean,
          deviceId?: string,
          isSpecialUser?: boolean
        }) => Promise<any>;
        logout: () => Promise<any>;
        getPerfil: () => Promise<any>;
        cambiarContrasena: (datos: { actual: string, nueva: string }) => Promise<any>;
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
        crear: (descripcion: string) => Promise<any>;
        restaurar: (id: string) => Promise<any>;
        eliminar: (id: string) => Promise<any>;
        listar: () => Promise<any[]>;
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
        request: (req: { method: string, endpoint: string, data?: any, params?: any }) => Promise<any>;
      };
      
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
      };
      
      receive: (channel: string, callback: (...args: any[]) => void) => boolean;
      removeListener: (channel: string) => boolean;
    };
  }
}
