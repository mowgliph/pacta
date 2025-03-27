import { StateCreator } from 'zustand'

interface Notificacion {
  id: string
  tipo: 'info' | 'success' | 'warning' | 'error'
  mensaje: string
  titulo?: string
  duracion?: number
  accion?: {
    texto: string
    onClick: () => void
  }
}

export interface SliceNotificaciones {
  notificaciones: Notificacion[]
  mostrarNotificacion: (notificacion: Omit<Notificacion, 'id'>) => void
  mostrarExito: (mensaje: string, titulo?: string) => void
  mostrarError: (mensaje: string, titulo?: string) => void
  mostrarInfo: (mensaje: string, titulo?: string) => void
  mostrarAlerta: (mensaje: string, titulo?: string) => void
  eliminarNotificacion: (id: string) => void
  limpiarNotificaciones: () => void
}

export const crearSliceNotificaciones: StateCreator<SliceNotificaciones> = (set) => ({
  notificaciones: [],

  mostrarNotificacion: (notificacion) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    set((state) => ({
      notificaciones: [...state.notificaciones, { ...notificacion, id }]
    }))

    if (notificacion.duracion !== 0) {
      setTimeout(() => {
        set((state) => ({
          notificaciones: state.notificaciones.filter((n) => n.id !== id)
        }))
      }, notificacion.duracion || 5000)
    }
  },

  mostrarExito: (mensaje, titulo) => {
    set((state) => ({
      notificaciones: [...state.notificaciones, {
        id: `${Date.now()}-success`,
        tipo: 'success',
        mensaje,
        titulo,
        duracion: 3000
      }]
    }))
  },

  mostrarError: (mensaje, titulo) => {
    set((state) => ({
      notificaciones: [...state.notificaciones, {
        id: `${Date.now()}-error`,
        tipo: 'error',
        mensaje,
        titulo,
        duracion: 5000
      }]
    }))
  },

  mostrarInfo: (mensaje, titulo) => {
    set((state) => ({
      notificaciones: [...state.notificaciones, {
        id: `${Date.now()}-info`,
        tipo: 'info',
        mensaje,
        titulo,
        duracion: 4000
      }]
    }))
  },

  mostrarAlerta: (mensaje, titulo) => {
    set((state) => ({
      notificaciones: [...state.notificaciones, {
        id: `${Date.now()}-warning`,
        tipo: 'warning',
        mensaje,
        titulo,
        duracion: 4000
      }]
    }))
  },

  eliminarNotificacion: (id) => {
    set((state) => ({
      notificaciones: state.notificaciones.filter((n) => n.id !== id)
    }))
  },

  limpiarNotificaciones: () => {
    set({ notificaciones: [] })
  }
})