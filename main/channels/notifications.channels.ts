/**
 * Canales IPC relacionados con notificaciones
 */
import {
  CreateNotificationRequest,
  MarkNotificationReadRequest,
  NotificationsListResponse,
} from "../shared/types";
import { ipcMain } from "electron";
import { NotificationService } from "../services/notification.service";

/**
 * Enumera los canales IPC para notificaciones
 */
export enum NotificationChannels {
  // Canales de lectura
  GET_USER_NOTIFICATIONS = "notifications:getUserNotifications",
  GET_UNREAD_COUNT = "notifications:getUnreadCount",

  // Canales de escritura
  CREATE = "notifications:create",
  MARK_AS_READ = "notifications:markAsRead",
  MARK_ALL_AS_READ = "notifications:markAllAsRead",
  DELETE = "notifications:delete",

  // Canales de eventos
  NOTIFICATION_CREATED = "notifications:created",
  NOTIFICATION_READ = "notifications:read",
  NOTIFICATION_DELETED = "notifications:deleted",
}

/**
 * Interfaz para solicitudes relacionadas con notificaciones
 */
export interface NotificationsRequests {
  [NotificationChannels.GET_USER_NOTIFICATIONS]: {
    request: { userId: string; filters?: any };
    response: NotificationsListResponse;
  };
  [NotificationChannels.GET_UNREAD_COUNT]: {
    request: { userId: string };
    response: { count: number };
  };
  [NotificationChannels.CREATE]: {
    request: CreateNotificationRequest;
    response: { success: boolean; notification: any; message?: string };
  };
  [NotificationChannels.MARK_AS_READ]: {
    request: MarkNotificationReadRequest;
    response: { success: boolean; message?: string };
  };
  [NotificationChannels.MARK_ALL_AS_READ]: {
    request: { userId: string };
    response: { success: boolean; count: number; message?: string };
  };
  [NotificationChannels.DELETE]: {
    request: { id: string; userId: string };
    response: { success: boolean; message?: string };
  };
  [NotificationChannels.NOTIFICATION_CREATED]: {
    request: { notification: NotificationPayload };
    response: { success: boolean; message?: string };
  };
  [NotificationChannels.NOTIFICATION_READ]: {
    request: { notificationId: string; userId: string };
    response: { success: boolean; message?: string };
  };
  [NotificationChannels.NOTIFICATION_DELETED]: {
    request: { notificationId: string; userId: string };
    response: { success: boolean; message?: string };
  };
}

export interface NotificationPayload {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  createdAt?: Date;
  read?: boolean;
}

export enum NotificationType {
  CONTRACT = "contract",
  SUPPLEMENT = "supplement",
  SYSTEM = "system",
  WARNING = "warning",
  INFO = "info",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export function registerNotificationChannels() {
  ipcMain.handle("notifications:getAll", async (_, filters?: any) => {
    return await NotificationService.getNotifications(filters);
  });

  ipcMain.handle("notifications:markAsRead", async (_, id: string) => {
    return await NotificationService.markAsRead(id);
  });

  ipcMain.handle("notifications:markAllAsRead", async () => {
    return await NotificationService.markAllAsRead();
  });
}
