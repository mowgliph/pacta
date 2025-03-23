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
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejar tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejar error de autenticación
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
)

export default api 