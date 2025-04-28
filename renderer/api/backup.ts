// Definir canales IPC para comunicación con el proceso principal
export const BackupChannels = {
  GET_ALL: "backup:getAll",
  CREATE: "backup:create",
  RESTORE: "backup:restore",
  DELETE: "backup:delete",
};

// Servicios de API para backups
export const backupApi = {
  /**
   * Obtener lista de backups disponibles
   */
  getBackups: async () => {
    return window.Electron.ipcRenderer.invoke(BackupChannels.GET_ALL);
  },

  /**
   * Crear un nuevo backup manual
   */
  createBackup: async (userId) => {
    return window.Electron.ipcRenderer.invoke(BackupChannels.CREATE, { 
      userId,
      isManual: true,
    });
  },

  /**
   * Restaurar un backup específico
   */
  restoreBackup: async (fileName, userId) => {
    return window.Electron.ipcRenderer.invoke(BackupChannels.RESTORE, { 
      fileName, 
      userId 
    });
  },

  /**
   * Eliminar un backup específico
   */
  deleteBackup: async (fileName, userId) => {
    return window.Electron.ipcRenderer.invoke(BackupChannels.DELETE, { 
      fileName, 
      userId 
    });
  }
}; 