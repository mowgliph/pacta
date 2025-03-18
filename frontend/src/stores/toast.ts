import { defineStore } from 'pinia';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastState {
  toasts: Toast[];
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    toasts: []
  }),

  actions: {
    addToast(type: Toast['type'], message: string, duration = 5000) {
      const id = Date.now();
      this.toasts.push({ id, type, message });

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