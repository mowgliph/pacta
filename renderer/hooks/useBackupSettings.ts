import { useState, useEffect } from 'react';

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  maxBackups: number;
  backupPath: string;
  lastBackup?: string;
  nextBackup?: string;
}

export function useBackupSettings() {
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackup: false,
    backupFrequency: 'daily',
    maxBackups: 30,
    backupPath: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await window.electron.ipcRenderer.invoke('backup:get-settings');
      if (response?.success) {
        setSettings(response.data);
      }
    } catch (err) {
      setError('Error al cargar la configuración de respaldos');
      console.error('Error fetching backup settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<BackupSettings>) => {
    try {
      setLoading(true);
      const response = await window.electron.ipcRenderer.invoke(
        'backup:update-settings',
        { ...settings, ...newSettings }
      );
      if (response?.success) {
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
      return response;
    } catch (err) {
      setError('Error al guardar la configuración');
      console.error('Error saving backup settings:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setLoading(true);
      const response = await window.electron.ipcRenderer.invoke('backup:create');
      if (response?.success) {
        await fetchSettings(); // Actualizar el estado con el último respaldo
      }
      return response;
    } catch (err) {
      setError('Error al crear el respaldo');
      console.error('Error creating backup:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    saveSettings,
    createBackup,
    refresh: fetchSettings,
  };
}
