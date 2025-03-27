import { StateCreator } from 'zustand'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'usuario'
}

export interface SliceAutenticacion {
  usuario: Usuario | null
  token: string | null
  cargando: boolean
  error: string | null
  iniciarSesion: (email: string, password: string) => Promise<void>
  cerrarSesion: () => void
  verificarSesion: () => Promise<void>
}

export const crearSliceAutenticacion: StateCreator<SliceAutenticacion> = (set) => ({
  usuario: null,
  token: null,
  cargando: false,
  error: null,

  iniciarSesion: async (email, password) => {
    set({ cargando: true, error: null })
    try {
      // Aquí iría la llamada a la API
      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      const datos = await respuesta.json()
      set({ usuario: datos.usuario, token: datos.token, cargando: false })
    } catch (error) {
      set({ error: 'Error al iniciar sesión', cargando: false })
    }
  },

  cerrarSesion: () => {
    set({ usuario: null, token: null })
    localStorage.removeItem('pacta-store')
  },

  verificarSesion: async () => {
    set({ cargando: true, error: null })
    try {
      const respuesta = await fetch('/api/auth/verify')
      const datos = await respuesta.json()
      set({ usuario: datos.usuario, cargando: false })
    } catch (error) {
      set({ error: 'Sesión inválida', usuario: null, token: null, cargando: false })
    }
  }
})