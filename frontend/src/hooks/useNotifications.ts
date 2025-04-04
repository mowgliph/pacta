import { showSuccess, showError, showWarning, showInfo } from '@/hooks/useToast';

/**
 * Hook que proporciona métodos simplificados para mostrar notificaciones
 * Utiliza el sistema de toasts para mostrar mensajes al usuario
 */
export function useNotifications() {
  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}