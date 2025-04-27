import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types/contracts"

interface AuthState {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

interface NotificationState {
  notifications: Array<{
    id: string
    title: string
    message: string
    type: "info" | "warning" | "error" | "success"
    read: boolean
  }>
  addNotification: (notification: Omit<NotificationState["notifications"][0], "id" | "read">) => void
  markAsRead: (id: string) => void
  clearNotifications: () => void
}

interface Store extends AuthState, UIState, NotificationState {}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Auth state
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // UI state
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      theme: "light",
      setTheme: (theme) => set({ theme }),

      // Notification state
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              id: crypto.randomUUID(),
              ...notification,
              read: false,
            },
          ],
        })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "pacta-storage",
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
      }),
    },
  ),
)
