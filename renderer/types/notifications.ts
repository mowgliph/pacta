export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  CONTRACT = "contract",
  SUPPLEMENT = "supplement",
  SYSTEM = "system",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
}

export interface UserNotification extends NotificationPayload {
  id: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum NotificationChannels {
  CREATE = "notifications:create",
  GET_USER_NOTIFICATIONS = "notifications:getUserNotifications",
  MARK_AS_READ = "notifications:markAsRead",
  MARK_ALL_AS_READ = "notifications:markAllAsRead",
  GET_UNREAD_COUNT = "notifications:getUnreadCount",
  DELETE = "notifications:delete",
  NOTIFICATION_CREATED = "notifications:created",
  NOTIFICATION_READ = "notifications:read",
  NOTIFICATION_DELETED = "notifications:deleted",
}
