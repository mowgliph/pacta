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

// Lista de canales personalizados que no están en IPC_CHANNELS
// Lista de canales personalizados que aún no se han migrado a IPC_CHANNELS
const customChannels = [
  // Agregar aquí cualquier canal nuevo antes de moverlo a IPC_CHANNELS
];

const validInvokeChannels = [
  ...flattenChannels(IPC_CHANNELS),
  ...customChannels,
];

/**
 * Validar si un canal está en la lista de canales permitidos
 * @param {string} channel - Nombre del canal a validar
 * @returns {boolean} - Verdadero si el canal está permitido
 */
const isValidChannel = (channel) => {
  return validInvokeChannels.includes(channel);
};

// APIs seguras expuestas al proceso de renderizado a través de contextBridge
contextBridge.exposeInMainWorld("electron", {
  reports: {
    exportPDF: (data, template) =>
      ipcRenderer.invoke("export:pdf", { data, template }),
    exportExcel: (data, template) =>
      ipcRenderer.invoke("export:excel", { data, template }),
    getTemplates: () =>
      ipcRenderer.invoke("report:templates:get"),
    saveTemplate: (name, content) =>
      ipcRenderer.invoke("report:template:save", { name, content }),
    deleteTemplate: (name) =>
      ipcRenderer.invoke("report:template:delete", name),
  },
  license: {
    async validateLicense(licenseData) {
      return await ipcRenderer.invoke(
        IPC_CHANNELS.LICENSE.VALIDATE,
        licenseData
      );
    },
    async getLicenseStatus() {
      return await ipcRenderer.invoke(IPC_CHANNELS.LICENSE.STATUS);
    },
    async revokeLicense(licenseNumber) {
      return await ipcRenderer.invoke(
        IPC_CHANNELS.LICENSE.REVOKE,
        licenseNumber
      );
    },
    async listLicenses() {
      return await ipcRenderer.invoke(IPC_CHANNELS.LICENSE.LIST);
    },
    async getLicenseInfo(licenseNumber) {
      return await ipcRenderer.invoke(IPC_CHANNELS.LICENSE.INFO, licenseNumber);
    },
  },
  // API genérica de IPC
  ipcRenderer: {
    invoke: (channel, ...args) => {
      if (isValidChannel(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Canal no permitido: ${channel}`);
    },
    on: (channel, func) => {
      if (isValidChannel(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeListener: (channel, func) => {
      if (isValidChannel(channel)) {
        ipcRenderer.removeListener(channel, func);
      }
    },
  },
  // APIs específicas
  app: {
    onUpdateAvailable: (callback) =>
      ipcRenderer.on(IPC_CHANNELS.APP.UPDATE_AVAILABLE, callback),
    removeUpdateListener: (callback) =>
      ipcRenderer.removeListener(IPC_CHANNELS.APP.UPDATE_AVAILABLE, callback),
    restart: () => ipcRenderer.invoke(IPC_CHANNELS.APP.RESTART),
  },
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
    delete: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.DELETE, id),
    export: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.EXPORT, id),
    upload: (file) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.UPLOAD, file),
    archive: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.ARCHIVE, id),
    getArchived: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.GET_ARCHIVED, id),
    restore: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.RESTORE, id),
    listArchived: () =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.LIST_ARCHIVED),
    updateAccessControl: (id, data) =>
      ipcRenderer.invoke(
        IPC_CHANNELS.DATA.CONTRACTS.UPDATE_ACCESS_CONTROL,
        id,
        data
      ),
    assignUsers: (id, users) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.ASSIGN_USERS, id, users),
    getById: (id) =>
      ipcRenderer.invoke(IPC_CHANNELS.DATA.CONTRACTS.GET_BY_ID, id),
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
    getById: (id) => ipcRenderer.invoke(IPC_CHANNELS.DATA.USERS.GET_BY_ID, id),
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
  },
  // Reportes
  reports: {
    exportPDF: (data, template) =>
      ipcRenderer.invoke(IPC_CHANNELS.REPORT.EXPORT_PDF, { data, template }),
    exportExcel: (data, template) =>
      ipcRenderer.invoke(IPC_CHANNELS.REPORT.EXPORT_EXCEL, { data, template }),
    getTemplates: () =>
      ipcRenderer.invoke(IPC_CHANNELS.REPORT.TEMPLATES.GET),
    saveTemplate: (name, content) =>
      ipcRenderer.invoke(IPC_CHANNELS.REPORT.TEMPLATES.SAVE, { name, content }),
    deleteTemplate: (name) =>
      ipcRenderer.invoke(IPC_CHANNELS.REPORT.TEMPLATES.DELETE, name),
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
    create: (description) =>
      ipcRenderer.invoke(IPC_CHANNELS.BACKUPS.CREATE, description),
    restore: (id) => ipcRenderer.invoke(IPC_CHANNELS.BACKUPS.RESTORE, id),
    delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.BACKUPS.DELETE, id),
    list: () => ipcRenderer.invoke(IPC_CHANNELS.BACKUPS.LIST),
    cleanOld: () => ipcRenderer.invoke(IPC_CHANNELS.BACKUPS.CLEAN_OLD),
  },
  // Theme
  theme: {
    getSystemTheme: () => ipcRenderer.invoke(IPC_CHANNELS.THEME.GET_SYSTEM),
    getSavedTheme: () => ipcRenderer.invoke(IPC_CHANNELS.THEME.GET_SAVED),
    setAppTheme: (theme) =>
      ipcRenderer.invoke(IPC_CHANNELS.THEME.SET_APP, theme),
    onSystemThemeChange: (callback) => {
      ipcRenderer.on(IPC_CHANNELS.THEME.SYSTEM_CHANGED, (event, ...args) =>
        callback(...args)
      );
    },
    removeSystemThemeListener: (callback) => {
      ipcRenderer.removeListener(IPC_CHANNELS.THEME.SYSTEM_CHANGED, callback);
    },
  },
  // API genérica
  api: {
    request: (req) => ipcRenderer.invoke("api:request", req),
  },
});
