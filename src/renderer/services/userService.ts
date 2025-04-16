import { SMTPConfig } from '@/renderer/api/electronAPI';

// Funciones existentes del servicio de usuario
// ...existing code...

// Funciones para la gestión de la configuración SMTP
export const getSMTPConfig = async (): Promise<SMTPConfig> => {
  try {
    const response = await window.electronAPI.smtp.getConfig();
    return response;
  } catch (error) {
    console.error('Error al obtener la configuración SMTP:', error);
    throw error;
  }
};

export const updateSMTPConfig = async (config: SMTPConfig): Promise<SMTPConfig> => {
  try {
    const response = await window.electronAPI.smtp.updateConfig(config);
    return response;
  } catch (error) {
    console.error('Error al actualizar la configuración SMTP:', error);
    throw error;
  }
};

// Función para probar la conexión SMTP
export const testSMTPConnection = async (config: SMTPConfig): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await window.electronAPI.smtp.testConnection(config);
    return response;
  } catch (error) {
    console.error('Error al probar la conexión SMTP:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido al probar la conexión' 
    };
  }
};