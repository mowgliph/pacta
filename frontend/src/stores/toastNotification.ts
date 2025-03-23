import { defineStore } from 'pinia';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  icon?: string;
  autoClose?: boolean;
  duration?: number;
}

interface ToastNotificationState {
  notifications: ToastNotification[];
}

export const useToastNotificationStore = defineStore('toastNotification', {
  state: (): ToastNotificationState => ({
    notifications: []
  }),

  actions: {
    // Método para añadir una notificación
    addNotification(notification: Omit<ToastNotification, 'id'>) {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newNotification = {
        ...notification,
        id,
        autoClose: notification.autoClose !== false,
        duration: notification.duration || 5000
      };
      
      this.notifications.push(newNotification);
      return id;
    },

    // Método para eliminar una notificación
    removeNotification(id: string) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },

    // Métodos de conveniencia
    success(message: string, options = {}) {
      return this.addNotification({ type: 'success', message, ...options });
    },

    error(message: string, options = {}) {
      return this.addNotification({ type: 'error', message, ...options });
    },

    warning(message: string, options = {}) {
      return this.addNotification({ type: 'warning', message, ...options });
    },

    info(message: string, options = {}) {
      return this.addNotification({ type: 'info', message, ...options });
    },

    // Limpiar todas las notificaciones
    clearAll() {
      this.notifications = [];
    }
  }
}); 