"use client";
import { useCallback } from "react";
import type { NotificationOptions } from "../types/electron.d";

export const useNotification = () => {
  const notify = useCallback(
    async (options: NotificationOptions) => {
      try {
        if (!window.electron?.notifications?.show) {
          throw new Error('API de notificaciones no disponible');
        }

        await window.electron.notifications.show(options);
      } catch (err) {
        console.error('Error al mostrar notificación:', err);
        window.dispatchEvent(new CustomEvent("api-error", {
          detail: {
            error: err instanceof Error ? err.message : 'Error desconocido',
            type: 'notification-error' as const
          }
        }));
      }
    },
    []
  );

  return { notify };
};
