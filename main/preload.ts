import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./channels/ipc-channels";

// Convertir la estructura de canales en una lista plana para validación
const flattenChannels = (channels: any): string[] => {
  return Object.entries(channels).reduce((acc: string[], [key, value]) => {
    if (typeof value === "object") {
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
  // Autenticación
  auth: {
    login: (credentials: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH.LOGIN, credentials),
    logout: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.LOGOUT),
    verify: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.VERIFY),
    refresh: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.REFRESH),
  },
  // Contratos
  contracts: {
    list: (filtros?: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.LIST, filtros),
    create: (datos: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.CREATE, datos),
    update: (id: string, datos: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.UPDATE, id, datos),
    delete: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.DELETE, id),
    export: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.EXPORT, id),
    upload: (file: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.UPLOAD, file),
    archive: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.ARCHIVE, id),
    updateAccessControl: (id: string, data: any) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.DATA.CONTRACTS.UPDATE_ACCESS_CONTROL,
        id,
        data
      ),
    assignUsers: (id: string, users: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.ASSIGN_USERS, id, users),
    getById: (id: string) => ipcRenderer.invoke("contracts:getById", id),
  },
  // Suplementos
  supplements: {
    list: (contractId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.LIST, contractId),
    create: (contractId: string, data: any) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.DATA.SUPPLEMENTS.CREATE,
        contractId,
        data
      ),
    update: (id: string, data: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.UPDATE, id, data),
    delete: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.DELETE, id),
    export: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.EXPORT, id),
    upload: (file: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.UPLOAD, file),
  },
  // Documentos
  documents: {
    list: (filters?: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.LIST, filters),
    upload: (file: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.UPLOAD, file),
    delete: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.DELETE, id),
    download: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.DOWNLOAD, id),
    getByContract: (contractId: string) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_CONTRACT,
        contractId
      ),
    getBySupplement: (supplementId: string) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_SUPPLEMENT,
        supplementId
      ),
    open: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.OPEN, id),
  },
  // Usuarios
  users: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.LIST),
    create: (userData: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.CREATE, userData),
    update: (userData: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.UPDATE, userData),
    delete: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.DELETE, id),
    toggleActive: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.TOGGLE_ACTIVE, id),
    changePassword: (data: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.CHANGE_PASSWORD, data),
    getById: (id: string) => ipcRenderer.invoke("users:getById", id),
  },
  // Roles
  roles: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.DATA.ROLES.LIST),
    create: (data: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.ROLES.CREATE, data),
    update: (data: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.ROLES.UPDATE, data),
    delete: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.ROLES.DELETE, id),
  },
  // Estadísticas
  statistics: {
    dashboard: () => ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.DASHBOARD),
    contracts: (filters?: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS, filters),
    export: (type: string, filters?: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.EXPORT, type, filters),
    contractsByStatus: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS_BY_STATUS),
    contractsByType: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS_BY_TYPE),
    contractsByCurrency: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS_BY_CURRENCY),
    contractsByUser: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS_BY_USER),
    contractsCreatedByMonth: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS_CREATED_BY_MONTH),
    contractsExpiredByMonth: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRED_BY_MONTH),
    supplementsCountByContract: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.SUPPLEMENTS_COUNT_BY_CONTRACT),
    contractsExpiringSoon: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS_EXPIRING_SOON),
    contractsWithoutDocuments: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS_WITHOUT_DOCUMENTS),
    usersActivity: () =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.USERS_ACTIVITY),
  },
  // Sistema
  system: {
    openFile: (path: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.OPEN_FILE, path),
    saveFile: (path: string, content: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SAVE_FILE, path, content),
    backup: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.BACKUP),
    restore: (backupId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.RESTORE, backupId),
    settings: {
      get: (key: string) =>
        ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SETTINGS.GET, key),
      update: (key: string, value: any) =>
        ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE, key, value),
    },
  },
  // Notificaciones
  notifications: {
    show: (options: { title: string; body: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.SHOW, options),
    clear: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.CLEAR, id),
    markRead: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.MARK_READ, id),
    getUnread: () => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.GET_UNREAD),
  },
  // Backups
  backups: {
    create: (description?: string) =>
      ipcRenderer.invoke("backups:create", description),
    restore: (id: string) => ipcRenderer.invoke("backups:restore", id),
    delete: (id: string) => ipcRenderer.invoke("backups:delete", id),
    list: () => ipcRenderer.invoke("backups:list"),
    cleanOld: () => ipcRenderer.invoke("backups:clean-old"),
  },
  // Theme
  theme: {
    getSystemTheme: () => ipcRenderer.invoke("theme:get-system"),
    setAppTheme: (theme: "light" | "dark" | "system") =>
      ipcRenderer.invoke("theme:set-app", theme),
  },
  // API genérica
  api: {
    request: (req: {
      method: string;
      endpoint: string;
      data?: any;
      params?: any;
    }) => ipcRenderer.invoke("api:request", req),
  },
  // IPC seguro
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      if (isValidChannel(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Canal IPC no permitido: ${channel}`));
    },
  },
  files: {
    open: (options: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.OPEN_FILE, options),
    save: (options: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SAVE_FILE, options),
  },
});
