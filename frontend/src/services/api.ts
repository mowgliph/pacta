import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'

// Definición de tipos para la respuesta de error de la API
interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// Definición de tipos para el error personalizado
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Crear instancia de axios con configuración base
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const authStore = useAuthStore()
    const apiError: ApiError = {
      message: error.response?.data?.message || 'Error en la petición',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors
    }

    // Si el error es 401 (no autorizado)
    if (error.response?.status === 401) {
      // Si estamos en la ruta de login, no intentar refrescar el token
      if (window.location.pathname === '/login') {
        return Promise.reject(apiError)
      }

      // Intentar refrescar el token
      const refreshed = await authStore.refreshToken()
      
      if (!refreshed) {
        // Si no se pudo refrescar, cerrar sesión
        authStore.logout()
        window.location.href = '/login'
      } else {
        // Reintentar la petición original
        const config = error.config
        if (config) {
          return api(config)
        }
      }
    }

    // Si el error es 403 (prohibido)
    if (error.response?.status === 403) {
      window.location.href = '/license-required'
    }

    return Promise.reject(apiError)
  }
)

export default api 