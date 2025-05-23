import { useState, useEffect } from "react";
import { Bell, LogOut, LogIn, Settings } from "lucide-react";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./dialog";

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  internalLink?: string;
}

function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const result = await window.Electron.notifications.getUnread();
      setNotifications(result || []);
    } catch (err: any) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    for (const id of notifications.map((n) => n.id)) {
      // @ts-ignore
      await window.Electron.notifications.markRead(id);
    }
    fetchNotifications();
  };

  return { notifications, loading, fetchNotifications, markAllAsRead };
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { notifications, loading, markAllAsRead, fetchNotifications } =
    useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  return (
    <header className="w-full h-16 bg-white flex items-center justify-between px-8 shadow-sm">
      <div className="flex-1" />
      <div className="flex items-center gap-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="relative">
              <Bell size={22} className="text-[#018ABE]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F44336] text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notificaciones</DialogTitle>
            </DialogHeader>
            <div className="max-h-80 overflow-y-auto flex flex-col gap-2 mt-2">
              {loading ? (
                <div className="text-[#757575]">Cargando...</div>
              ) : notifications.length === 0 ? (
                <div className="text-[#757575]">
                  No hay notificaciones nuevas.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded p-3 border transition cursor-${
                      n.internalLink ? "pointer" : "default"
                    } ${
                      n.read ? "bg-[#F5F5F5]" : "bg-[#D6E8EE] border-[#018ABE]"
                    } hover:shadow-md`}
                    onClick={() => n.internalLink && navigate(n.internalLink)}
                    title={
                      n.internalLink ? `Ir a ${n.internalLink}` : undefined
                    }
                  >
                    <div className="font-semibold text-[#001B48]">
                      {n.title}
                    </div>
                    <div className="text-sm text-[#757575]">{n.body}</div>
                    <div className="text-xs text-[#757575] mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                    {n.internalLink && (
                      <div className="text-xs text-[#018ABE] mt-1 underline">
                        Ver detalle
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button
                className="text-xs text-[#018ABE] hover:underline"
                onClick={markAllAsRead}
                disabled={loading || notifications.length === 0}
              >
                Marcar todas como leídas
              </button>
              <DialogClose asChild>
                <button className="text-xs text-[#757575] hover:underline">
                  Cerrar
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#97CADB] flex items-center justify-center text-[#001B48] font-bold">
            {user ? user.name?.[0]?.toUpperCase() || "U" : "U"}
          </div>
          <div className="text-[#333] text-sm">
            <div className="font-semibold">{user ? user.name : "Invitado"}</div>
            <div className="text-xs text-[#757575]">
              {user ? user.role : "Sin sesión"}
            </div>
          </div>
          {user && (
            <button
              className="flex items-center gap-1 text-[#018ABE] text-xs ml-2"
              onClick={() => navigate("/settings")}
            >
              <Settings size={16} /> Configuración
            </button>
          )}
          {user ? (
            <button
              className="flex items-center gap-1 text-[#F44336] text-xs ml-2"
              onClick={logout}
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          ) : (
            <button
              className="flex items-center gap-1 text-[#018ABE] text-xs ml-2"
              onClick={() => navigate("/login")}
            >
              <LogIn size={16} /> Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
