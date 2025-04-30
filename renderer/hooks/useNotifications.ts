"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  NotificationPayload,
  NotificationType,
  NotificationPriority,
  UserNotification,
  NotificationChannels,
} from "@/types/notifications";

interface Notification extends NotificationPayload {
  id: string;
  createdAt: Date;
  read: boolean;
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // @ts-ignore - Electron está expuesto por el preload script
        const userNotifications = await window.Electron.ipcRenderer.invoke(
          NotificationChannels.GET_USER_NOTIFICATIONS,
          userId
        );
        setNotifications(userNotifications);

        // @ts-ignore - Electron está expuesto por el preload script
        const count = await window.Electron.ipcRenderer.invoke(
          NotificationChannels.GET_UNREAD_COUNT,
          userId
        );
        setUnreadCount(count);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Configurar listeners para actualizaciones en tiempo real
    const handleNotificationCreated = (
      _: any,
      notification: UserNotification
    ) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleNotificationRead = (_: any, { id }: { id: string }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleNotificationDeleted = (_: any, { id }: { id: string }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    // @ts-ignore - Electron está expuesto por el preload script
    window.Electron.ipcRenderer.on(
      NotificationChannels.NOTIFICATION_CREATED,
      handleNotificationCreated
    );
    // @ts-ignore - Electron está expuesto por el preload script
    window.Electron.ipcRenderer.on(
      NotificationChannels.NOTIFICATION_READ,
      handleNotificationRead
    );
    // @ts-ignore - Electron está expuesto por el preload script
    window.Electron.ipcRenderer.on(
      NotificationChannels.NOTIFICATION_DELETED,
      handleNotificationDeleted
    );

    return () => {
      // @ts-ignore - Electron está expuesto por el preload script
      window.Electron.ipcRenderer.removeAllListeners(
        NotificationChannels.NOTIFICATION_CREATED
      );
      // @ts-ignore - Electron está expuesto por el preload script
      window.Electron.ipcRenderer.removeAllListeners(
        NotificationChannels.NOTIFICATION_READ
      );
      // @ts-ignore - Electron está expuesto por el preload script
      window.Electron.ipcRenderer.removeAllListeners(
        NotificationChannels.NOTIFICATION_DELETED
      );
    };
  }, [userId]);

  const createNotification = async (payload: NotificationPayload) => {
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      return await window.Electron.ipcRenderer.invoke(
        NotificationChannels.CREATE,
        payload
      );
    } catch (error) {
      console.error("Error al crear notificación:", error);
      throw error;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      await window.Electron.ipcRenderer.invoke(
        NotificationChannels.MARK_AS_READ,
        id,
        userId
      );
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      await window.Electron.ipcRenderer.invoke(
        NotificationChannels.MARK_ALL_AS_READ,
        userId
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error
      );
      throw error;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      await window.Electron.ipcRenderer.invoke(
        NotificationChannels.DELETE,
        id,
        userId
      );
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      throw error;
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
