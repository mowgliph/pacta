import { IconX, IconCheck, IconInfoCircle, IconAlertTriangle } from "@tabler/icons-react";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";

type NotificationType = "success" | "error" | "info" | "warning";

type NotificationProps = {
  title: string;
  message: string;
  type?: NotificationType;
  onClose?: () => void;
  duration?: number;
  show?: boolean;
};

const iconMap = {
  success: <IconCheck className="h-5 w-5" />,
  error: <IconX className="h-5 w-5" />,
  info: <IconInfoCircle className="h-5 w-5" />,
  warning: <IconAlertTriangle className="h-5 w-5" />,
};

const styleMap = {
  success: "bg-green-50 border-green-500 text-green-700",
  error: "bg-red-50 border-red-500 text-red-700",
  info: "bg-blue-50 border-blue-500 text-blue-700",
  warning: "bg-yellow-50 border-yellow-500 text-yellow-700",
};

const iconStyleMap = {
  success: "bg-green-100 text-green-500",
  error: "bg-red-100 text-red-500",
  info: "bg-blue-100 text-blue-500",
  warning: "bg-yellow-100 text-yellow-500",
};

export function Notification({
  title,
  message,
  type = "info",
  onClose,
  duration = 5000,
  show = true,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setIsVisible(show);
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border-l-4 shadow-lg transition-all duration-300",
        styleMap[type],
        isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn("flex-shrink-0 rounded-full p-1", iconStyleMap[type])}>
            {iconMap[type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm">{message}</p>
          </div>
          <button
            type="button"
            className="ml-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={handleClose}
          >
            <IconX className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
} 