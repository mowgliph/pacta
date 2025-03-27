import { StateCreator } from 'zustand'

export interface SliceUI {
  tema: 'light' | 'dark'
  sidebarAbierto: boolean
  modalActivo: string | null
  cambiarTema: (tema: 'light' | 'dark') => void
  toggleSidebar: () => void
  abrirModal: (id: string) => void
  cerrarModal: () => void
}

export const crearSliceUI: StateCreator<SliceUI> = (set) => ({
  tema: 'light',
  sidebarAbierto: true,
  modalActivo: null,

  cambiarTema: (tema) => set({ tema }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarAbierto: !state.sidebarAbierto 
  })),
  
  abrirModal: (id) => set({ modalActivo: id }),
  
  cerrarModal: () => set({ modalActivo: null })
})