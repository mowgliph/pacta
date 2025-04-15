const { contextBridge, ipcRenderer } = require('electron');

// Exponer la API de Electron al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Método general de invocación
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),

  // Auth methods
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    register: (userData) => ipcRenderer.invoke('auth:register', userData),
    logout: () => ipcRenderer.invoke('auth:logout'),
    verifyToken: () => ipcRenderer.invoke('auth:verify'),
  },

  // Contract methods
  contracts: {
    getAll: (filters) => ipcRenderer.invoke('contracts:getAll', filters),
    getById: (id) => ipcRenderer.invoke('contracts:getById', id),
    create: (contractData) => ipcRenderer.invoke('contracts:create', contractData),
    update: (id, data) => ipcRenderer.invoke('contracts:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('contracts:delete', id),
    uploadDocument: (data) => ipcRenderer.invoke('contracts:uploadDocument', data),
    addSupplement: (contractId, data) => ipcRenderer.invoke('contracts:addSupplement', { contractId, data }),
    editSupplement: (contractId, supplementId, data) => 
      ipcRenderer.invoke('contracts:editSupplement', { contractId, supplementId, data }),
    deleteSupplement: (contractId, supplementId) => 
      ipcRenderer.invoke('contracts:deleteSupplement', { contractId, supplementId }),
  },

  // Statistics methods
  statistics: {
    getPublic: () => ipcRenderer.invoke('statistics:getPublic'),
    getPrivate: () => ipcRenderer.invoke('statistics:getPrivate'),
    fetch: (filters) => ipcRenderer.invoke('statistics:fetch', filters),
  },

  // File methods
  files: {
    select: (options) => ipcRenderer.invoke('files:select', options),
    open: (filePath) => ipcRenderer.invoke('files:open', filePath),
  },

  // Profile methods
  profile: {
    fetch: () => ipcRenderer.invoke('profile:fetch'),
    update: (data) => ipcRenderer.invoke('profile:update', data),
  },

  // Event listeners
  on: (channel, callback) => {
    if (channel.startsWith('notification:')) {
      ipcRenderer.on(channel, callback);
    }
  },
  removeAllListeners: (channel) => {
    if (channel.startsWith('notification:')) {
      ipcRenderer.removeAllListeners(channel);
    }
  },

  // System info
  getVersions: () => process.versions,
});