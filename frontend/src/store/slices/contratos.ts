import { StateCreator } from 'zustand'
import { Contract } from '@/features/contracts/types'

export interface SliceContratos {
  contratos: Contract[]
  cargando: boolean
  error: string | null
  obtenerContratos: () => Promise<void>
  agregarContrato: (contrato: Contract) => void
  actualizarContrato: (id: number, datos: Partial<Contract>) => void
  eliminarContrato: (id: number) => void
}

export const crearSliceContratos: StateCreator<SliceContratos> = (set) => ({
  contratos: [],
  cargando: false,
  error: null,

  obtenerContratos: async () => {
    set({ cargando: true, error: null })
    try {
      const respuesta = await fetch('/api/contratos')
      const datos: Contract[] = await respuesta.json()
      set({ contratos: datos, cargando: false })
    } catch (error) {
      set({ error: 'Error al obtener contratos', cargando: false })
    }
  },

  agregarContrato: (contrato) => {
    set((state) => ({
      contratos: [...state.contratos, contrato]
    }))
  },

  actualizarContrato: (id, datos) => {
    set((state) => ({
      contratos: state.contratos.map((contrato) =>
        contrato.id === id ? { ...contrato, ...datos } : contrato
      )
    }))
  },

  eliminarContrato: (id) => {
    set((state) => ({
      contratos: state.contratos.filter((contrato) => contrato.id !== id)
    }))
  }
})