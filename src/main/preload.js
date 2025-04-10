const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // System Information
  getVersions: () => ({
    chrome: process.versions.chrome,
    node: process.versions.node,
    electron: process.versions.electron,
  }),

  // Authentication
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
    register: (userData) => ipcRenderer.invoke('auth:register', userData),
    logout: () => ipcRenderer.invoke('auth:logout'),
    verifyToken: () => ipcRenderer.invoke('auth:verify'),
  },

  // Contract Management
  contracts: {
    getAll: () => ipcRenderer.invoke('contracts:getAll'),
    getById: (id) => ipcRenderer.invoke('contracts:getById', id),
    create: (contractData) => ipcRenderer.invoke('contracts:create', contractData),
    update: (id, data) => ipcRenderer.invoke('contracts:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('contracts:delete', id),
    uploadDocument: (contractId, filePath) => 
      ipcRenderer.invoke('contracts:uploadDocument', { contractId, filePath }),
  },

  // File Operations
  files: {
    select: (options) => ipcRenderer.invoke('files:select', options),
    save: (fileData) => ipcRenderer.invoke('files:save', fileData),
    open: (filePath) => ipcRenderer.invoke('files:open', filePath),
    getPdfPreview: (filePath) => ipcRenderer.invoke('files:getPdfPreview', filePath),
  },

  // Notifications
  notifications: {
    getAll: () => ipcRenderer.invoke('notifications:getAll'),
    markAsRead: (id) => ipcRenderer.invoke('notifications:markAsRead', id),
    subscribe: (callback) => 
      ipcRenderer.on('notification:new', (_, data) => callback(data)),
    unsubscribe: () => ipcRenderer.removeAllListeners('notification:new'),
  },

  // Contract Alerts
  alerts: {
    getExpiringContracts: () => ipcRenderer.invoke('alerts:expiringContracts'),
    getPendingReviews: () => ipcRenderer.invoke('alerts:pendingReviews'),
    subscribe: (callback) => 
      ipcRenderer.on('alerts:update', (_, data) => callback(data)),
    unsubscribe: () => ipcRenderer.removeAllListeners('alerts:update'),
  },

  // User Management
  users: {
    getProfile: () => ipcRenderer.invoke('users:getProfile'),
    updateProfile: (data) => ipcRenderer.invoke('users:updateProfile', data),
    changePassword: (data) => ipcRenderer.invoke('users:changePassword', data),
  },

  // System Events
  system: {
    onError: (callback) => ipcRenderer.on('system:error', (_, error) => callback(error)),
    onUpdate: (callback) => ipcRenderer.on('system:update', (_, data) => callback(data)),
    clearListeners: () => ipcRenderer.removeAllListeners(),
  }
});