const { contextBridge, ipcRenderer } = require("electron");
const { IPC_CHANNELS } = require("./channels/ipc-channels.cjs");

// Convertir la estructura de canales en una lista plana para validación
const flattenChannels = (channels) => {
  return Object.entries(channels).reduce((acc, [key, value]) => {
    if (typeof value === "object") {
      return [...acc, ...flattenChannels(value)];
    }
    return [...acc, value];
  }, []);
};

const validInvokeChannels = flattenChannels(IPC_CHANNELS);

/**
 * Validar si un canal está en la lista de canales permitidos
 * @param {string} channel - Nombre del canal a validar
 * @returns {boolean} - Verdadero si el canal está permitido
 */
const isValidChannel = (channel) => {
  return validInvokeChannels.includes(channel);
};

// APIs seguras expuestas al proceso de renderizado a través de contextBridge
contextBridge.exposeInMainWorld("Electron", {
  // Autenticación
  auth: {
    login: (credentials) =>
      ipcRenderer.invoke(IPC_CHANNELS.AUTH.LOGIN, credentials),
    logout: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.LOGOUT),
    verify: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.VERIFY),
    refresh: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.REFRESH),
  },
  // Contratos
  contracts: {
    list: (filtros) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.LIST, filtros),
    create: (datos) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.CREATE, datos),
    update: (id, datos) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.UPDATE, id, datos),
    delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.DELETE, id),
    export: (id) => ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.EXPORT, id),
    upload: (file) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.UPLOAD, file),
    archive: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.ARCHIVE, id),
    updateAccessControl: (id, data) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.DATA.CONTRACTS.UPDATE_ACCESS_CONTROL,
        id,
        data
      ),
    assignUsers: (id, users) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.ASSIGN_USERS, id, users),
    getById: (id) => ipcRenderer.invoke("contracts:getById", id),
  },
  // Suplementos
  supplements: {
    list: (contractId) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.LIST, contractId),
    create: (contractId, data) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.DATA.SUPPLEMENTS.CREATE,
        contractId,
        data
      ),
    update: (id, data) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.UPDATE, id, data),
    delete: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.DELETE, id),
    export: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.EXPORT, id),
    upload: (file) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.SUPPLEMENTS.UPLOAD, file),
  },
  // Documentos
  documents: {
    list: (filters) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.LIST, filters),
    upload: (file) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.UPLOAD, file),
    delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.DELETE, id),
    download: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.DOWNLOAD, id),
    getByContract: (contractId) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_CONTRACT,
        contractId
      ),
    getBySupplement: (supplementId) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.DATA.DOCUMENTS.GET_BY_SUPPLEMENT,
        supplementId
      ),
    open: (id) => ipcRenderer.invoke(IPC_CHANNELS.DATA.DOCUMENTS.OPEN, id),
  },
  // Usuarios
  users: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.LIST),
    create: (userData) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.CREATE, userData),
    update: (userData) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.UPDATE, userData),
    delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.DELETE, id),
    toggleActive: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.TOGGLE_ACTIVE, id),
    changePassword: (data) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.CHANGE_PASSWORD, data),
    getById: (id) => ipcRenderer.invoke("users:getById", id),
  },
  // Roles
  roles: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.DATA.ROLES.LIST),
    create: (data) => ipcRenderer.invoke(IPC_CHANNELS.DATA.ROLES.CREATE, data),
    update: (data) => ipcRenderer.invoke(IPC_CHANNELS.DATA.ROLES.UPDATE, data),
    delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.DATA.ROLES.DELETE, id),
  },
  // Estadísticas
  statistics: {
    dashboard: () => ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.DASHBOARD),
    contracts: (filters) =>
      ipcRenderer.invoke(IPC_CHANNELS.STATISTICS.CONTRACTS, filters),
    export: (type, filters) =>
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
    openFile: (path) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.OPEN_FILE, path),
    saveFile: (path, content) =>
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SAVE_FILE, path, content),
    backup: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.BACKUP),
    restore: (backupId) =>
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.RESTORE, backupId),
    settings: {
      get: (key) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SETTINGS.GET, key),
      update: (key, value) =>
        ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SETTINGS.UPDATE, key, value),
    },
  },
  // Notificaciones
  notifications: {
    show: (options) =>
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.SHOW, options),
    clear: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.CLEAR, id),
    markRead: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.MARK_READ, id),
    getUnread: () => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS.GET_UNREAD),
  },
  // Backups
  backups: {
    create: (description) => ipcRenderer.invoke("backups:create", description),
    restore: (id) => ipcRenderer.invoke("backups:restore", id),
    delete: (id) => ipcRenderer.invoke("backups:delete", id),
    list: () => ipcRenderer.invoke("backups:list"),
    cleanOld: () => ipcRenderer.invoke("backups:clean-old"),
  },
  // Theme
  theme: {
    getSystemTheme: () => ipcRenderer.invoke("theme:get-system"),
    setAppTheme: (theme) => ipcRenderer.invoke("theme:set-app", theme),
  },
  // API genérica
  api: {
    request: (req) => ipcRenderer.invoke("api:request", req),
  },
  // IPC seguro
  ipcRenderer: {
    invoke: (channel, ...args) => {
      if (isValidChannel(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Canal IPC no permitido: ${channel}`));
    },
  },
  files: {
    open: (options) =>
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.OPEN_FILE, options),
    save: (options) =>
      ipcRenderer.invoke(IPC_CHANNELS.SYSTEM.SAVE_FILE, options),
  },
});
