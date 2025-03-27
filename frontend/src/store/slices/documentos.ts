import { StateCreator } from 'zustand'
import { apiClient } from '@/lib/api/client'
import { AxiosError } from 'axios'

interface Documento {
  id: number
  nombre: string
  tipo: string
  url: string
  tamaño: number
  fechaCreacion: string
  contratoId?: number
}

export interface SliceDocumentos {
  documentos: Documento[]
  documentoSeleccionado: Documento | null
  cargando: boolean
  error: string | null
  subirDocumento: (archivo: File, contratoId?: number) => Promise<void>
  eliminarDocumento: (id: number) => Promise<void>
  obtenerDocumentos: (contratoId?: number) => Promise<void>
  seleccionarDocumento: (documento: Documento) => void
}

export const crearSliceDocumentos: StateCreator<SliceDocumentos> = (set) => ({
  documentos: [],
  documentoSeleccionado: null,
  cargando: false,
  error: null,

  subirDocumento: async (archivo, contratoId) => {
    set({ cargando: true, error: null })
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      if (contratoId) formData.append('contratoId', contratoId.toString())

      const { data } = await apiClient.post('/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      set((state) => ({
        documentos: [...state.documentos, data],
        cargando: false
      }))
    } catch (error) {
      const axiosError = error as AxiosError<{ mensaje: string }>
      set({ 
        error: axiosError.response?.data?.mensaje || 'Error al subir documento',
        cargando: false 
      })
    }
  },

  eliminarDocumento: async (id) => {
    set({ cargando: true, error: null })
    try {
      await apiClient.delete(`/documentos/${id}`)
      set((state) => ({
        documentos: state.documentos.filter(doc => doc.id !== id),
        cargando: false
      }))
    } catch (error) {
      const axiosError = error as AxiosError<{ mensaje: string }>
      set({ 
        error: axiosError.response?.data?.mensaje || 'Error al eliminar documento',
        cargando: false 
      })
    }
  },

  obtenerDocumentos: async (contratoId) => {
    set({ cargando: true, error: null })
    try {
      const url = contratoId ? `/documentos?contratoId=${contratoId}` : '/documentos'
      const { data } = await apiClient.get(url)
      set({ documentos: data, cargando: false })
    } catch (error) {
      const axiosError = error as AxiosError<{ mensaje: string }>
      set({ 
        error: axiosError.response?.data?.mensaje || 'Error al obtener documentos',
        cargando: false 
      })
    }
  },

  seleccionarDocumento: (documento) => {
    set({ documentoSeleccionado: documento })
  }
})