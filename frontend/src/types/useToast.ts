import { useToastStore } from '../stores/toast';

export function useToast() {
  const toastStore = useToastStore();

  return {
    success: toastStore.success,
    error: toastStore.error,
    warning: toastStore.warning,
    info: toastStore.info
  };
}