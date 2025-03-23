import { defineStore } from 'pinia';
import { useToastNotificationStore } from './toastNotification';

/**
 * @deprecated Este store está obsoleto. Usar useToastNotificationStore de ./toastNotification.ts en su lugar
 */
interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastState {
  toasts: Toast[];
}

/**
 * @deprecated Este store está obsoleto. Usar useToastNotificationStore de ./toastNotification.ts en su lugar
 */
export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    toasts: []
  }),

  actions: {
    addToast(type: Toast['type'], message: string, duration = 5000) {
      console.warn('useToastStore está obsoleto. Usar useToastNotificationStore en su lugar');
      
      // Utilizar el nuevo sistema de notificaciones pero mantener compatibilidad
      const notificationStore = useToastNotificationStore();
      const id = Date.now();
      
      // Agregar al array local para mantener compatibilidad
      this.toasts.push({ id, type, message });
      
      // También agregar al nuevo sistema
      notificationStore.addNotification({
        type,
        message,
        duration,
        autoClose: duration > 0
      });

      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }
    },

    removeToast(id: number) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    },

    success(message: string, duration?: number) {
      this.addToast('success', message, duration);
    },

    error(message: string, duration?: number) {
      this.addToast('error', message, duration);
    },

    warning(message: string, duration?: number) {
      this.addToast('warning', message, duration);
    },

    info(message: string, duration?: number) {
      this.addToast('info', message, duration);
    }
  }
});