"use client";
import { useCallback } from "react";
import { useAuth } from "@/store/auth";
import type { NotificationOptions } from "../types/electron.d";

export const useNotification = () => {
  const { user } = useAuth();
  
  const notify = useCallback(
    async (options: NotificationOptions) => {
      try {
        if (!window.electron?.notifications?.show) {
          throw new Error('API de notificaciones no disponible');
        }

        // Asegurarse de que se incluyan los campos requeridos
        const { title, body, ...restOptions } = options;
        const notificationData = {
          ...restOptions,
          userId: user?.id || 'system',
          title: title || 'Notificación',
          body: body || ''
        };

        await window.electron.notifications.show(notificationData);
      } catch (err) {
        console.error('Error al mostrar notificación:', err);
        window.dispatchEvent(new CustomEvent("api-error", {
          detail: {
            error: err instanceof Error ? err.message : 'Error desconocido',
            type: 'notification-error' as const,
            context: { notificationOptions: options }
          }
        }));
      }
    },
    [user?.id]
  );

  return { notify };
};
