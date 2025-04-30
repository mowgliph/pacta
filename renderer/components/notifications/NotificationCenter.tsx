"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { Spinner } from "@/components/ui/spinner";
import {
  NotificationType,
  NotificationPriority,
  NotificationChannels,
  UserNotification,
} from "@/types/notifications";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.URGENT:
      return "bg-red-100 text-red-800";
    case NotificationPriority.HIGH:
      return "bg-orange-100 text-orange-800";
    case NotificationPriority.MEDIUM:
      return "bg-yellow-100 text-yellow-800";
    case NotificationPriority.LOW:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.CONTRACT:
      return "📄";
    case NotificationType.SUPPLEMENT:
      return "📝";
    case NotificationType.SYSTEM:
      return "⚙️";
    case NotificationType.WARNING:
      return "⚠️";
    case NotificationType.INFO:
      return "ℹ️";
    default:
      return "📢";
  }
};

export function NotificationCenter() {
  const { user } = useAuth();
  const userId = user?.id;

  if (!userId) return null;

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const [notificationsState, setNotificationsState] = useState<
    UserNotification[]
  >([]);
  const [unreadCountState, setUnreadCountState] = useState(0);
  const [isLoadingState, setIsLoadingState] = useState(true);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return `Hoy a las ${format(date, "HH:mm", { locale: es })}`;
    } else if (diffInDays === 1) {
      return `Ayer a las ${format(date, "HH:mm", { locale: es })}`;
    } else if (diffInDays < 7) {
      return format(date, "EEEE", { locale: es });
    } else {
      return format(date, "d 'de' MMMM", { locale: es });
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.metadata?.contractId) {
      // Navegar al contrato
      window.location.href = `/contracts/${notification.metadata.contractId}`;
    }
    setOpen(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      await window.Electron.ipcRenderer.invoke(
        NotificationChannels.MARK_AS_READ,
        notificationId,
        userId
      );
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      await window.Electron.ipcRenderer.invoke(
        NotificationChannels.DELETE,
        notificationId,
        userId
      );
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // @ts-ignore - Electron está expuesto por el preload script
      await window.Electron.ipcRenderer.invoke(
        NotificationChannels.MARK_ALL_AS_READ,
        userId
      );
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error
      );
    }
  };

  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      try {
        // @ts-ignore - Electron está expuesto por el preload script
        const userNotifications = await window.Electron.ipcRenderer.invoke(
          NotificationChannels.GET_USER_NOTIFICATIONS,
          userId
        );
        setNotificationsState(userNotifications);

        // @ts-ignore - Electron está expuesto por el preload script
        const count = await window.Electron.ipcRenderer.invoke(
          NotificationChannels.GET_UNREAD_COUNT,
          userId
        );
        setUnreadCountState(count);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      } finally {
        setIsLoadingState(false);
      }
    };

    loadNotifications();
  }, [userId]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCountState > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
            {unreadCountState}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-background shadow-lg z-50">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-medium">Notificaciones</h3>
            {unreadCountState > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Marcar todas como leídas
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoadingState ? (
              <div className="p-4 text-center">Cargando...</div>
            ) : notificationsState.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No hay notificaciones
              </div>
            ) : (
              notificationsState.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    notification.read ? "bg-muted" : "bg-background"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
