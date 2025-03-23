import { useToastNotificationStore } from '../stores/toastNotification';

export function useNotification() {
  const notificationStore = useToastNotificationStore();

  return {
    success: notificationStore.success,
    error: notificationStore.error,
    warning: notificationStore.warning,
    info: notificationStore.info,
    // Funciones adicionales que no existían en useToast
    addNotification: notificationStore.addNotification,
    removeNotification: notificationStore.removeNotification,
    clearAll: notificationStore.clearAll
  };
} 