import { Backup } from "../types";

interface BackupResponse {
  success: boolean;
  backups?: Backup[];
  error?: string;
}

interface SingleBackupResponse {
  success: boolean;
  backup?: Backup;
  error?: string;
}

interface ScheduleConfigResponse {
  success: boolean;
  config?: {
    cronExpression: string;
    retentionDays: number;
    enabled: boolean;
  };
  error?: string;
}

export const backupApi = {
  // Obtener todos los respaldos
  getBackups: async (): Promise<BackupResponse> => {
    try {
      const result = await window.Electron.backups.listar();
      return {
        success: true,
        backups: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Error al obtener respaldos",
      };
    }
  },

  // Crear respaldo manual
  createBackup: async (
    userId: string,
    description: string
  ): Promise<SingleBackupResponse> => {
    try {
      const result = await window.Electron.backups.crear({
        userId,
        description,
      });
      return {
        success: true,
        backup: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Error al crear respaldo",
      };
    }
  },

  // Restaurar respaldo
  restoreBackup: async (
    backupId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await window.Electron.backups.restaurar({ backupId, userId });
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Error al restaurar respaldo",
      };
    }
  },

  // Eliminar respaldo
  deleteBackup: async (
    backupId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await window.Electron.backups.eliminar({ backupId });
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Error al eliminar respaldo",
      };
    }
  },

  // Obtener configuración de programación de respaldos
  getScheduleConfig: async (): Promise<ScheduleConfigResponse> => {
    try {
      const config = await window.Electron.backups.obtenerProgramacion();
      return {
        success: true,
        config,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.message || "Error al obtener la configuración de respaldos",
      };
    }
  },

  // Actualizar configuración de programación de respaldos
  updateScheduleConfig: async (config: {
    cronExpression: string;
    retentionDays: number;
    enabled: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      await window.Electron.backups.actualizarProgramacion(config);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.message || "Error al actualizar la configuración de respaldos",
      };
    }
  },

  // Limpiar respaldos antiguos
  cleanOldBackups: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await window.Electron.backups.limpiarAntiguos();
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Error al limpiar respaldos antiguos",
      };
    }
  },
};
