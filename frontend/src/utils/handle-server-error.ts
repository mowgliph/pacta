import { AxiosError } from 'axios';
import { showError } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api';

/**
 * Gestiona errores de servidor y muestra una notificación
 * @param error - Error recibido
 * @param defaultMessage - Mensaje por defecto
 * @returns Error procesado para mayor información
 */
export function handleServerError(
  error: unknown, 
  defaultMessage = 'Ha ocurrido un error en el servidor'
): ApiError {
  console.error('Error en solicitud al servidor:', error);
  
  let errorMessage = defaultMessage;
  const errorDetails: Record<string, string> = {};
  
  // Procesar error de Axios
  if (error instanceof AxiosError && error.response?.data) {
    const { message, errors } = error.response.data as ApiError;
    
    errorMessage = message || errorMessage;
    
    // Si hay errores de validación, construir detalles
    if (errors && Array.isArray(errors)) {
      errors.forEach(err => {
        if (err.field && err.message) {
          errorDetails[err.field] = err.message;
        }
      });
    }
  }
  
  // Mostrar notificación de error
  showError(errorMessage);
  
  // Devolver error estructurado
  return {
    message: errorMessage,
    errors: Object.entries(errorDetails).map(([field, message]) => ({ field, message })),
    code: error instanceof AxiosError ? String(error.response?.status || 'UNKNOWN') : 'UNKNOWN'
  };
}

/**
 * Versión del manejador de errores que no muestra notificaciones
 * Útil cuando quieres gestionar la notificación de otra manera
 */
export function handleServerErrorSilent(
  error: unknown, 
  defaultMessage = 'Ha ocurrido un error en el servidor'
): ApiError {
  console.error('Error en solicitud al servidor (silencioso):', error);
  
  let errorMessage = defaultMessage;
  const errorDetails: Record<string, string> = {};
  
  if (error instanceof AxiosError && error.response?.data) {
    const { message, errors } = error.response.data as ApiError;
    
    errorMessage = message || errorMessage;
    
    if (errors && Array.isArray(errors)) {
      errors.forEach(err => {
        if (err.field && err.message) {
          errorDetails[err.field] = err.message;
        }
      });
    }
  }
  
  return {
    message: errorMessage,
    errors: Object.entries(errorDetails).map(([field, message]) => ({ field, message })),
    code: error instanceof AxiosError ? String(error.response?.status || 'UNKNOWN') : 'UNKNOWN'
  };
}