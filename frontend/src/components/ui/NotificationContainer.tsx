import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Notification } from "./Notification";
import { cn } from "../../lib/utils";

type NotificationType = "success" | "error" | "info" | "warning";

type NotificationProps = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
};

type NotificationContextType = {
  showNotification: (notification: Omit<NotificationProps, "id">) => string;
  hideNotification: (id: string) => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const showNotification = useCallback((notification: Omit<NotificationProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
    return id;
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({
      showNotification,
      hideNotification,
      clearNotifications,
    }),
    [showNotification, hideNotification, clearNotifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col space-y-2">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => hideNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
} 