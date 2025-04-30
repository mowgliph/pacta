import { useState, useEffect } from "react";
import { Backup, BackupResponse } from "@/types/backup.types";
import { ipcRenderer } from "electron";
export enum BackupChannels {
  GET_ALL = "backup:getAll",
  CREATE = "backup:create",
  RESTORE = "backup:restore",
  DELETE = "backup:delete",
  CLEAN_OLD = "backup:cleanOld",
}

export const useBackup = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ipcRenderer.invoke(BackupChannels.GET_ALL);
      if (response.success) {
        setBackups(response.data || []);
      } else {
        setError(response.error || "Error al cargar los backups");
      }
    } catch (err) {
      setError("Error al cargar los backups");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (description?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ipcRenderer.invoke(BackupChannels.CREATE, {
        description,
      });
      if (response.success) {
        await loadBackups();
      } else {
        setError(response.error || "Error al crear el backup");
      }
    } catch (err) {
      setError("Error al crear el backup");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ipcRenderer.invoke(BackupChannels.RESTORE, {
        backupId,
      });
      if (!response.success) {
        setError(response.error || "Error al restaurar el backup");
      }
    } catch (err) {
      setError("Error al restaurar el backup");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ipcRenderer.invoke(BackupChannels.DELETE, {
        backupId,
      });
      if (response.success) {
        await loadBackups();
      } else {
        setError(response.error || "Error al eliminar el backup");
      }
    } catch (err) {
      setError("Error al eliminar el backup");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cleanOldBackups = async (daysToKeep: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ipcRenderer.invoke(BackupChannels.CLEAN_OLD, {
        daysToKeep,
      });
      if (response.success) {
        await loadBackups();
      } else {
        setError(response.error || "Error al limpiar los backups antiguos");
      }
    } catch (err) {
      setError("Error al limpiar los backups antiguos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  return {
    backups,
    loading,
    error,
    createBackup,
    restoreBackup,
    deleteBackup,
    cleanOldBackups,
    loadBackups,
  };
};
