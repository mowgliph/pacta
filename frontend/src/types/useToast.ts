import { useToastNotificationStore } from '../stores/toastNotification';

export function useToast() {
  const notificationStore = useToastNotificationStore();

  return {
    success: notificationStore.success,
    error: notificationStore.error,
    warning: notificationStore.warning,
    info: notificationStore.info
  };
}