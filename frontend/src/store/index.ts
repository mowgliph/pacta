import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { crearSliceAutenticacion, SliceAutenticacion } from './slices/autenticacion'
import { crearSliceContratos, SliceContratos } from './slices/contratos'
import { crearSliceUI, SliceUI } from './slices/ui'
import { crearSliceNotificaciones, SliceNotificaciones } from './slices/notificaciones'

export interface StoreState extends 
  SliceAutenticacion,
  SliceContratos,
  SliceUI,
  SliceNotificaciones {}

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...crearSliceAutenticacion(...a),
        ...crearSliceContratos(...a),
        ...crearSliceUI(...a),
        ...crearSliceNotificaciones(...a),
      }),
      {
        name: 'pacta-store',
        partialize: (state) => ({
          usuario: state.usuario,
          token: state.token,
          contratos: state.contratos,
          tema: state.tema
        })
      }
    ),
    { name: 'PACTA Store' }
  )
)