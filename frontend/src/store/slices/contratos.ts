import { StateCreator } from 'zustand'
import { Contract } from '@/features/contracts/types'
import { apiClient } from '@/lib/api/client'

export interface FiltrosContrato {
  estado?: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED'
  busqueda?: string
  fechaInicio?: string
  fechaFin?: string
  empresaId?: number
  departamentoId?: number
  etiquetas?: string[]
  pagina?: number
  limite?: number
  ordenarPor?: string
  direccionOrden?: 'asc' | 'desc'
}

export interface SliceContratos {
  contratos: Contract[]
  contratoSeleccionado: Contract | null
  filtros: FiltrosContrato
  cargando: boolean
  error: string | null
  obtenerContratos: () => Promise<void>
  obtenerContrato: (id: number) => Promise<void>
  crearContrato: (contrato: Partial<Contract>) => Promise<void>
  actualizarContrato: (id: number, datos: Partial<Contract>) => Promise<void>
  eliminarContrato: (id: number) => Promise<void>
  setFiltros: (filtros: Partial<FiltrosContrato>) => void
  resetFiltros: () => void
  getContratosFiltrados: () => Contract[]
}

export const crearSliceContratos: StateCreator<SliceContratos> = (set, get) => ({
  contratos: [],
  contratoSeleccionado: null,
  cargando: false,
  error: null,
  filtros: {},

  obtenerContratos: async () => {
    set({ cargando: true, error: null })
    try {
      const { data } = await apiClient.get<Contract[]>('/api/v1/contracts')
      set({ contratos: data, cargando: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al obtener contratos',
        cargando: false 
      })
    }
  },

  obtenerContrato: async (id) => {
    set({ cargando: true, error: null })
    try {
      const { data } = await apiClient.get<Contract>(`/api/v1/contracts/${id}`)
      set({ contratoSeleccionado: data, cargando: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al obtener contrato',
        cargando: false 
      })
    }
  },

  crearContrato: async (contrato) => {
    set({ cargando: true, error: null })
    try {
      const { data } = await apiClient.post<Contract>('/api/v1/contracts', contrato)
      set((state) => ({ 
        contratos: [...state.contratos, data],
        cargando: false 
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear contrato',
        cargando: false 
      })
    }
  },

  actualizarContrato: async (id, datos) => {
    set({ cargando: true, error: null })
    try {
      const { data } = await apiClient.put<Contract>(`/api/v1/contracts/${id}`, datos)
      set((state) => ({
        contratos: state.contratos.map(c => c.id === id ? data : c),
        contratoSeleccionado: data,
        cargando: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar contrato',
        cargando: false 
      })
    }
  },

  eliminarContrato: async (id) => {
    set({ cargando: true, error: null })
    try {
      await apiClient.delete(`/api/v1/contracts/${id}`)
      set((state) => ({
        contratos: state.contratos.filter(c => c.id !== id),
        cargando: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar contrato',
        cargando: false 
      })
    }
  },

  setFiltros: (filtros) => {
    set((state) => ({
      filtros: { ...state.filtros, ...filtros }
    }))
  },

  resetFiltros: () => {
    set({ filtros: {} })
  },

  getContratosFiltrados: () => {
    const { contratos, filtros } = get()
    return contratos.filter(contrato => {
      if (filtros.estado && contrato.status !== filtros.estado) return false
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase()
        if (!contrato.title.toLowerCase().includes(busqueda) &&
            !contrato.contractNumber.toLowerCase().includes(busqueda)) {
          return false
        }
      }
      if (filtros.fechaInicio && new Date(contrato.startDate) < new Date(filtros.fechaInicio)) return false
      if (filtros.fechaFin && new Date(contrato.endDate) > new Date(filtros.fechaFin)) return false
      return true
    })
  }
})