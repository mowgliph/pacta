import { StateCreator } from 'zustand'

interface Modal {
  id: string
  component: React.ComponentType<any>
  props?: Record<string, any>
}

export interface SliceUI {
  tema: 'light' | 'dark' | 'system'
  modales: Modal[]
  sidebarAbierto: boolean
  cambiarTema: (tema: 'light' | 'dark' | 'system') => void
  abrirModal: (modal: Modal) => void
  cerrarModal: (id: string) => void
  toggleSidebar: () => void
}

export const crearSliceUI: StateCreator<SliceUI> = (set, get) => ({
  tema: 'system',
  modales: [],
  sidebarAbierto: true,

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
  }
})