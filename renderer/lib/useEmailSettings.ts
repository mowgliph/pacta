import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/electron';

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  security: 'tls' | 'ssl' | 'none';
}

export function useEmailSettings() {
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    security: 'tls',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke<ApiResponse<EmailSettings>>('email:get-settings');
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        throw new Error(response.error?.message || 'Error al obtener la configuración');
      }
    } catch (error) {
      console.error('Error al cargar la configuración de correo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al cargar la configuración: ${errorMessage}`, {
        description: 'Por favor, inténtalo de nuevo más tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<EmailSettings>) => {
    setIsSaving(true);
    try {
      const response = await window.electron.ipcRenderer.invoke<ApiResponse<EmailSettings>>(
        'email:update-settings',
        { ...settings, ...newSettings }
      );

      if (response.success && response.data) {
        setSettings(prev => ({
          ...prev,
          ...response.data,
          lastTested: new Date().toISOString(),
        }));
        toast.success('Configuración de correo guardada correctamente', {
          description: 'La configuración se ha actualizado correctamente.',
        });
        return true;
      } else {
        throw new Error(response.error?.message || 'Error al guardar la configuración');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al guardar la configuración', {
        description: errorMessage,
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const testConnection = useCallback(async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke<ApiResponse<boolean>>('email:test-connection');
      if (response.success) {
        setSettings(prev => ({
          ...prev,
          lastTested: new Date().toISOString(),
          lastError: undefined,
        }));
        toast.success('Conexión exitosa', {
          description: 'La conexión con el servidor SMTP se ha establecido correctamente.',
        });
        return true;
      } else {
        const errorMessage = response.error?.message || 'Error al probar la conexión';
        setSettings(prev => ({
          ...prev,
          lastError: errorMessage,
        }));
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error en la conexión', {
        description: errorMessage,
      });
      return false;
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    saveSettings,
    testConnection,
  };
}
