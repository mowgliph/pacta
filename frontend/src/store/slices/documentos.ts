import { StateCreator } from 'zustand'
import { ContractsService, Attachment } from '@/features/contracts'
import { ApiError } from '@/lib/api'

export interface SliceDocumentos {
  documentos: Attachment[]
  documentoSeleccionado: Attachment | null
  cargando: boolean
  error: string | null
  subirDocumento: (archivo: File, contratoId: string) => Promise<void>
  eliminarDocumento: (contratoId: string, id: string) => Promise<void>
  obtenerDocumentos: (contratoId: string) => Promise<void>
  seleccionarDocumento: (documento: Attachment) => void
}

export const crearSliceDocumentos: StateCreator<SliceDocumentos> = (set) => ({
  documentos: [],
  documentoSeleccionado: null,
  cargando: false,
  error: null,

  subirDocumento: async (archivo, contratoId) => {
    set({ cargando: true, error: null })
    try {
      const adjunto = await ContractsService.uploadAttachment(contratoId, archivo)

      set((state) => ({
        documentos: [...state.documentos, adjunto],
        cargando: false
      }))
    } catch (error) {
      const apiError = error as ApiError
      set({ 
        error: apiError.message || 'Error al subir documento',
        cargando: false 
      })
    }
  },

  eliminarDocumento: async (contratoId, id) => {
    set({ cargando: true, error: null })
    try {
      await ContractsService.deleteAttachment(contratoId, id)
      
      set((state) => ({
        documentos: state.documentos.filter(doc => doc.id !== id),
        cargando: false
      }))
    } catch (error) {
      const apiError = error as ApiError
      set({ 
        error: apiError.message || 'Error al eliminar documento',
        cargando: false 
      })
    }
  },

  obtenerDocumentos: async (contratoId) => {
    set({ cargando: true, error: null })
    try {
      const adjuntos = await ContractsService.getContractAttachments(contratoId)
      
      set({ 
        documentos: adjuntos, 
        cargando: false 
      })
    } catch (error) {
      const apiError = error as ApiError
      set({ 
        error: apiError.message || 'Error al obtener documentos',
        cargando: false 
      })
    }
  },

  seleccionarDocumento: (documento) => {
    set({ documentoSeleccionado: documento })
  }
})