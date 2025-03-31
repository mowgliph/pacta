import { StateCreator } from 'zustand'
import { StatusType } from '@/components/layout/StatusBanner'

interface Modal {
  id: string
  component: React.ComponentType<any>
  props?: Record<string, any>
}

export interface Notification {
  id: string
  type: StatusType
  title: string
  message?: string
  autoClose?: boolean
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface SliceUI {
  tema: 'light' | 'dark' | 'system'
  modales: Modal[]
  sidebarAbierto: boolean
  notifications: Notification[]
  cambiarTema: (tema: 'light' | 'dark' | 'system') => void
  abrirModal: (modal: Modal) => void
  cerrarModal: (id: string) => void
  toggleSidebar: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const crearSliceUI: StateCreator<SliceUI> = (set, get) => ({
  tema: 'system',
  modales: [],
  sidebarAbierto: true,
  notifications: [],

  cambiarTema: (tema) => {
    set({ tema })
    localStorage.setItem('tema', tema)
    if (tema === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  abrirModal: (modal) => {
    set((state) => ({
      modales: [...state.modales, modal]
    }))
  },

  cerrarModal: (id) => {
    set((state) => ({
      modales: state.modales.filter(modal => modal.id !== id)
    }))
  },

  toggleSidebar: () => {
    set((state) => ({
      sidebarAbierto: !state.sidebarAbierto
    }))
  },

  addNotification: (notification) => {
    const id = `notification-${Date.now()}`
    const newNotification = {
      ...notification,
      id,
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000,
    }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }))
    
    // Auto-close logic
    if (newNotification.autoClose) {
      setTimeout(() => {
        get().removeNotification(id)
      }, newNotification.duration)
    }
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id
      )
    }))
  },
  
  clearNotifications: () => {
    set({ notifications: [] })
  }
})