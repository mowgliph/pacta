import { ApiErrorEvent } from '../components/ui/ErrorHandler';

type ErrorMetadata = {
  channel?: string;
  originalError?: any;
  response?: any;
  environment?: {
    isElectron?: boolean;
    hasIpc?: boolean;
    userAgent?: string;
    online?: boolean;
  };
};

export const dispatchError = (type: string, error: Error, metadata: ErrorMetadata = {}) => {
  // Configurar información del entorno si no se proporciona
  const environment = {
    isElectron: typeof window.electron !== 'undefined',
    hasIpc: !!(window.electron?.ipcRenderer),
    userAgent: navigator.userAgent,
    online: navigator.onLine,
    ...metadata.environment
  };

  // Crear el evento de error
  const errorEvent = new CustomEvent('api-error', {
    detail: {
      error: error.message,
      type,
      metadata: {
        ...metadata,
        environment,
        timestamp: new Date().toISOString(),
      },
    },
  }) as ApiErrorEvent;

  // Disparar el evento
  window.dispatchEvent(errorEvent);

  // Devolver el error para permitir el encadenamiento
  return error;
};
