import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Tipos para notificaciones
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Estado para el store de notificaciones
 */
interface NotificationState {
  // Lista de notificaciones
  notifications: Notification[];
  
  // Contadores
  unreadCount: number;
  
  // Métodos para gestionar notificaciones
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (id: string) => void;
  
  // Comunicación con API
  fetchNotifications: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Store de notificaciones
 * Gestiona el estado de las notificaciones de la aplicación
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      
      // Añadir una nueva notificación
      addNotification: (notification) => {
        const newNotification: Notification = {
          id: crypto.randomUUID(),
          ...notification,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));
        
        // También guardar en la base de datos si es posible
        try {
          window.Electron.ipcRenderer.invoke("notifications:create", newNotification)
            .catch(console.error);
        } catch (error) {
          console.error("Error al guardar notificación:", error);
        }
      },
      
      // Marcar como leída
      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((n) => 
            n.id === id ? { ...n, read: true } : n
          );
          
          const newUnreadCount = updatedNotifications.filter(n => !n.read).length;
          
          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount
          };
        });
        
        // Actualizar en la base de datos
        try {
          window.Electron.ipcRenderer.invoke("notifications:markRead", { 
            notificationId: id,
            userId: get().notifications.find(n => n.id === id)?.metadata?.userId
          }).catch(console.error);
        } catch (error) {
          console.error("Error al marcar notificación como leída:", error);
        }
      },
      
      // Marcar todas como leídas
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }));
        
        // Actualizar en la base de datos
        try {
          window.Electron.ipcRenderer.invoke("notifications:markAllRead", { 
            userId: get().notifications[0]?.metadata?.userId
          }).catch(console.error);
        } catch (error) {
          console.error("Error al marcar todas las notificaciones como leídas:", error);
        }
      },
      
      // Eliminar todas las notificaciones
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      
      // Eliminar una notificación
      deleteNotification: (id) => {
        set((state) => {
          const isUnread = state.notifications.find(n => n.id === id)?.read === false;
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: isUnread ? state.unreadCount - 1 : state.unreadCount
          };
        });
        
        // Actualizar en la base de datos
        try {
          window.Electron.ipcRenderer.invoke("notifications:delete", { 
            notificationId: id,
            userId: get().notifications.find(n => n.id === id)?.metadata?.userId
          }).catch(console.error);
        } catch (error) {
          console.error("Error al eliminar notificación:", error);
        }
      },
      
      // Cargar notificaciones desde la API
      fetchNotifications: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const userId = window.Electron?.auth?.user?.id;
          if (!userId) {
            throw new Error("Usuario no autenticado");
          }
          
          const response = await window.Electron.ipcRenderer.invoke(
            "notifications:getUserNotifications", 
            { userId }
          );
          
          if (response && Array.isArray(response.notifications)) {
            const notifications = response.notifications.map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type || "info",
              read: n.isRead,
              createdAt: n.createdAt,
              actionUrl: n.actionUrl,
              metadata: n.metadata || {}
            }));
            
            const unreadCount = notifications.filter((n: Notification) => !n.read).length;
            
            set({ 
              notifications, 
              unreadCount,
              isLoading: false 
            });
          }
        } catch (error: any) {
          console.error("Error al cargar notificaciones:", error);
          set({ 
            error: error.message || "Error al cargar notificaciones",
            isLoading: false 
          });
        }
      }
    }),
    {
      name: "notification-storage",
      partialize: (state) => ({
        notifications: state.notifications
          .filter(n => n.type === "warning" || n.type === "error")
          .slice(0, 5)
      }),
    }
  )
);

/**
 * Selector para notificaciones no leídas
 */
export const selectUnreadNotifications = (state: NotificationState) => 
  state.notifications.filter(n => !n.read);

/**
 * Selector para conteo de notificaciones no leídas
 */
export const selectUnreadCount = (state: NotificationState) => state.unreadCount; 