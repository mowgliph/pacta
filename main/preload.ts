import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./channels/ipc-channels";

// Convertir la estructura de canales en una lista plana para validación
const flattenChannels = (channels: any): string[] => {
  return Object.entries(channels).reduce((acc: string[], [key, value]) => {
    if (typeof value === 'object') {
      return [...acc, ...flattenChannels(value)];
    }
    return [...acc, value as string];
  }, []);
};

const validInvokeChannels = flattenChannels(IPC_CHANNELS);

/**
 * Validar si un canal está en la lista de canales permitidos
 * @param {string} channel - Nombre del canal a validar
 * @returns {boolean} - Verdadero si el canal está permitido
 */
const isValidChannel = (channel: string): boolean => {
  return validInvokeChannels.includes(channel);
};

// APIs seguras expuestas al proceso de renderizado a través de contextBridge
contextBridge.exposeInMainWorld("Electron", {
  // API de la aplicación
  app: {
    relaunch: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.OPEN_FILE),
    exit: (code: number) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SAVE_FILE, code),
    getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SETTINGS.GET, 'version'),
    getPath: (name: string) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SETTINGS.GET, name),
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SETTINGS.GET, 'info'),
  },

  // API para autenticación
  auth: {
    login: (credentials: any) => ipcRenderer.invoke(IPC_CHANNELS.AUTH.LOGIN, credentials),
    logout: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.LOGOUT),
    verify: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.VERIFY),
    refresh: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.REFRESH),
  },

  // API para contratos
  contracts: {
    list: (filtros?: any) => ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.LIST, filtros),
    create: (datos: any) => ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.CREATE, datos),
    update: (id: string, datos: any) => ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.UPDATE, id, datos),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.DELETE, id),
    export: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.EXPORT, id),
  },

  // API para documentos
  documents: {
    list: (filtros?: any) => ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.LIST, filtros),
    upload: (file: any) => ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.UPLOAD, file),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.DELETE, id),
    download: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.DOWNLOAD, id),
  },

  // API para usuarios
  users: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.LIST),
    create: (userData: any) => ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.CREATE, userData),
    update: (userData: any) => ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.UPDATE, userData),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.DELETE, id),
  },

  // API para sistema
  system: {
    openFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.OPEN_FILE, path),
    saveFile: (path: string, content: any) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SAVE_FILE, path, content),
    backup: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.BACKUP),
    restore: (backupId: string) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.RESTORE, backupId),
    settings: {
      get: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SETTINGS.GET, key),
      update: (key: string, value: any) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE, key, value),
    },
  },

  // API para notificaciones
  notifications: {
    show: (options: { title: string; body: string }) => 
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.SHOW, options),
    clear: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.CLEAR, id),
  },

  // API para IPC invocaciones generales con validación
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      if (isValidChannel(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Canal IPC no permitido: ${channel}`));
    },
  },
});
