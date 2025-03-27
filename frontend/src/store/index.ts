import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { crearSliceAutenticacion, SliceAutenticacion } from './slices/autenticacion'
import { crearSliceContratos, SliceContratos } from './slices/contratos'
import { crearSliceUI, SliceUI } from './slices/ui'
import { crearSliceNotificaciones, SliceNotificaciones } from './slices/notificaciones'

interface StoreState extends 
  SliceAutenticacion,
  SliceContratos,
  SliceUI,
  SliceNotificaciones {}

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...crearSliceAutenticacion(...a),
      ...crearSliceContratos(...a),
      ...crearSliceUI(...a),
      ...crearSliceNotificaciones(...a),
    }),
    {
      name: 'pacta-store',
      partialize: (state: StoreState) => ({
        usuario: state.usuario,
        token: state.token,
        contratos: state.contratos,
      }),
    }
  )
)