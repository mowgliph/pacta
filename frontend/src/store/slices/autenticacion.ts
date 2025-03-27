import { StateCreator } from 'zustand'
import { apiClient } from '@/lib/api/client'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'usuario'
  permisos: string[]
}

export interface SliceAutenticacion {
  usuario: Usuario | null
  token: string | null
  cargando: boolean
  error: string | null
  permisos: { [key: string]: boolean }
  iniciarSesion: (email: string, password: string) => Promise<void>
  cerrarSesion: () => void
  verificarSesion: () => Promise<void>
  actualizarPermisos: (permisos: string[]) => void
  tienePermiso: (permiso: string) => boolean
}

export const crearSliceAutenticacion: StateCreator<SliceAutenticacion> = (set, get) => ({
  usuario: null,
  token: null,
  cargando: false,
  error: null,
  permisos: {},

  iniciarSesion: async (email, password) => {
    set({ cargando: true, error: null })
    try {
      const { data } = await apiClient.post('/api/v1/auth/login', { email, password })
      
      // Configurar el token en el cliente API
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      
      set({ 
        usuario: data.usuario,
        token: data.token,
        cargando: false
      })
      get().actualizarPermisos(data.usuario.permisos)
      
      // Guardar token en localStorage
      localStorage.setItem('token', data.token)
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al iniciar sesión',
        cargando: false 
      })
    }
  },

  cerrarSesion: () => {
    // Limpiar token del cliente API
    delete apiClient.defaults.headers.common['Authorization']
    
    set({ 
      usuario: null, 
      token: null,
      permisos: {} 
    })
    localStorage.removeItem('token')
  },

  verificarSesion: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    set({ cargando: true })
    try {
      // Configurar token en el cliente API
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      const { data } = await apiClient.get('/api/v1/auth/verify')
      
      set({ 
        usuario: data.usuario,
        token,
        cargando: false 
      })
      get().actualizarPermisos(data.usuario.permisos)
    } catch (error) {
      delete apiClient.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
      set({ 
        usuario: null,
        token: null,
        permisos: {},
        cargando: false 
      })
    }
  },

  actualizarPermisos: (permisos) => {
    const permisosMap = permisos.reduce((acc, permiso) => ({
      ...acc,
      [permiso]: true
    }), {})
    set({ permisos: permisosMap })
  },

  tienePermiso: (permiso) => {
    return get().permisos[permiso] || false
  }
})