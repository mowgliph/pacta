import { StateCreator } from 'zustand'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface SliceNotificaciones {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, 'id'>) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
  dismissNotification: (id: string) => void
  clearNotifications: () => void
}

export const crearSliceNotificaciones: StateCreator<SliceNotificaciones> = (set) => ({
  notifications: [],

  showNotification: (notification) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }))

    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        }))
      }, notification.duration || 5000)
    }
  },

  showSuccess: (message, title) => {
    set((state) => ({
      notifications: [...state.notifications, {
        id: `${Date.now()}-success`,
        type: 'success',
        message,
        title,
        duration: 3000
      }]
    }))
  },

  showError: (message, title) => {
    set((state) => ({
      notifications: [...state.notifications, {
        id: `${Date.now()}-error`,
        type: 'error',
        message,
        title,
        duration: 5000
      }]
    }))
  },

  showWarning: (message, title) => {
    set((state) => ({
      notifications: [...state.notifications, {
        id: `${Date.now()}-warning`,
        type: 'warning',
        message,
        title,
        duration: 4000
      }]
    }))
  },

  showInfo: (message, title) => {
    set((state) => ({
      notifications: [...state.notifications, {
        id: `${Date.now()}-info`,
        type: 'info',
        message,
        title,
        duration: 4000
      }]
    }))
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  }
})