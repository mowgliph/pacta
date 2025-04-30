import { Notification } from "../../types/notification";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Check, X } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
}: NotificationItemProps) {
  const getTypeStyles = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 text-green-800 border-green-200";
      case "error":
        return "bg-red-50 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-50 text-blue-800 border-blue-200";
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-200",
        getTypeStyles(),
        !notification.read && "ring-2 ring-offset-2"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium">{notification.title}</h3>
          <p className="text-sm mt-1">{notification.message}</p>
          <p className="text-xs mt-2 opacity-70">
            {formatDistanceToNow(notification.timestamp, {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 hover:bg-white/50 rounded-full transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDismiss(notification.id)}
            className="p-1 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
