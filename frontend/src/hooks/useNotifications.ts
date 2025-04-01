import { useStore } from '@/store';
import { type StatusType } from '@/components/layout/StatusBanner';

type NotificationAction = {
  label: string;
  onClick: () => void;
}

export const useNotifications = () => {
  const { addNotification, removeNotification, clearNotifications } = useStore((state) => ({
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
  }));

  const showNotification = (
    title: string,
    message?: string,
    type: StatusType = 'info',
    options?: {
      autoClose?: boolean;
      duration?: number;
      action?: NotificationAction;
    }
  ) => {
    addNotification({
      type,
      title,
      message,
      ...options,
    });
  };

  const showSuccess = (title: string, message?: string, options?: Omit<Parameters<typeof showNotification>[3], 'type'>) => {
    showNotification(title, message, 'success', options);
  };

  const showError = (title: string, message?: string, options?: Omit<Parameters<typeof showNotification>[3], 'type'>) => {
    showNotification(title, message, 'error', options);
  };

  const showWarning = (title: string, message?: string, options?: Omit<Parameters<typeof showNotification>[3], 'type'>) => {
    showNotification(title, message, 'warning', options);
  };

  const showInfo = (title: string, message?: string, options?: Omit<Parameters<typeof showNotification>[3], 'type'>) => {
    showNotification(title, message, 'info', options);
  };

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
  };
};