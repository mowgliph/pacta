import { useState, useEffect, useCallback } from "react";
import {
  BellIcon,
  ExitIcon,
  EnterIcon,
  GearIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type NotificationType = "info" | "warning" | "error" | "success";

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  type?: NotificationType;
  createdAt: string;
  internalLink?: string;
}

function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (!window.electron.notifications.getUnread) {
        throw new Error("API de notificaciones no disponible");
      }

      const result = await window.electron.notifications.getUnread(user.id);
      setNotifications(Array.isArray(result) ? result : []);
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar notificaciones";
      console.error("Error al cargar notificaciones:", err);
      setError("No se pudieron cargar las notificaciones");

      const errorEvent = new CustomEvent("api-error", {
        detail: {
          error: errorMessage,
          type: "notifications-error" as const,
          metadata: {
            originalError: err,
            timestamp: new Date().toISOString(),
          },
        },
      });
      window.dispatchEvent(errorEvent);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!window.electron.notifications.markRead) {
      console.error("API para marcar notificaciones como leídas no disponible");
      return;
    }

    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      if (unreadNotifications.length === 0) return;

      await Promise.all(
        unreadNotifications.map((n) =>
          window.electron.notifications.markRead(n.id).catch(console.error)
        )
      );

      setNotifications((prev) =>
        prev.map((n) => (n.read ? n : { ...n, read: true }))
      );

      toast.success("Todas las notificaciones marcadas como leídas");
    } catch (err) {
      console.error("Error al marcar notificaciones como leídas:", err);
      toast.error("Error al actualizar notificaciones");
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
  };
}

const getNotificationIcon = (type?: NotificationType) => {
  switch (type) {
    case "success":
      return <CheckIcon className="h-4 w-4" />;
    case "warning":
      return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
    case "error":
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    case "info":
    default:
      return <BellIcon className="h-4 w-4" />;
  }
};

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { notifications, loading, markAllAsRead, fetchNotifications, error } =
    useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (notification.internalLink) {
        navigate(notification.internalLink);
        setOpen(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  return (
    <header className="w-full h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className={cn(
                "relative p-2 rounded-full transition-colors",
                "hover:bg-[#E6F4F9] focus:outline-none focus:ring-2 focus:ring-[#018ABE]/50 focus:ring-offset-2"
              )}
              aria-label={`Notificaciones ${
                hasUnread ? `(${unreadCount} sin leer)` : ""
              }`}
            >
              <BellIcon
                className={cn(
                  "h-5 w-5 text-[#018ABE] transition-transform",
                  hasUnread && "animate-pulse"
                )}
              />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 bg-[#F44336] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            <DialogHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold text-[#001B48]">
                  Notificaciones
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    disabled={loading || !notifications.some((n) => !n.read)}
                    className="text-xs h-7 px-2 text-[#018ABE] hover:bg-[#E6F4F9]"
                  >
                    {loading ? (
                      <UpdateIcon className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckIcon className="mr-1 h-3.5 w-3.5" />
                    )}
                    Marcar todo
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="py-2">
              {error ? (
                <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
                  <ExclamationTriangleIcon className="h-10 w-10 text-red-500 mb-3" />
                  <p className="text-sm text-gray-600 mb-2">
                    Error al cargar notificaciones
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchNotifications}
                    className="mt-2"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <UpdateIcon className="h-8 w-8 animate-spin text-[#018ABE] mb-3" />
                  <p className="text-sm text-gray-600">
                    Cargando notificaciones...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <BellIcon className="h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-600">
                    No hay notificaciones
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Te notificaremos cuando haya novedades
                  </p>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1">
                  <div className="space-y-2 py-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "group flex items-start gap-3 p-3 rounded-lg mx-2 transition-colors cursor-pointer",
                          notification.read
                            ? "bg-white hover:bg-gray-50"
                            : "bg-[#E6F4F9] hover:bg-[#D6E8EE] border border-[#97CADB]",
                          notification.internalLink &&
                            "hover:ring-1 hover:ring-[#018ABE]"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 rounded-full p-1.5 flex-shrink-0",
                            notification.read
                              ? "text-gray-400"
                              : "text-[#018ABE] bg-white"
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={cn(
                                "text-sm font-medium line-clamp-2",
                                notification.read
                                  ? "text-gray-800"
                                  : "text-[#001B48]"
                              )}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-[#018ABE] flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2 text-left">
                            {notification.body}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                {
                                  addSuffix: true,
                                  locale: es,
                                }
                              )}
                            </span>
                            {notification.internalLink && (
                              <span className="text-xs text-[#018ABE] font-medium group-hover:underline">
                                Ver más
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t px-4 py-3 bg-gray-50">
              <DialogClose asChild>
                <Button variant="outline" size="sm" className="text-sm">
                  Cerrar
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menú de perfil */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="relative group">
                <button
                  className="flex items-center gap-2 focus:outline-none"
                  aria-label="Menú de usuario"
                >
                  <div className="w-9 h-9 rounded-full bg-[#97CADB] flex items-center justify-center text-[#001B48] font-bold border-2 border-white shadow-sm">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-800">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.role?.toLowerCase()}
                    </div>
                  </div>
                </button>

                {/* Menú desplegable */}
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => navigate("/profile")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <GearIcon className="mr-3 h-4 w-4 text-gray-500" />
                      Mi perfil
                    </button>
                    <button
                      onClick={() => navigate("/settings")}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <GearIcon className="mr-3 h-4 w-4 text-gray-500" />
                      Configuración
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <ExitIcon className="mr-3 h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-[#018ABE] border-[#018ABE] hover:bg-[#E6F4F9] hover:text-[#0171a1]"
              >
                <EnterIcon className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
