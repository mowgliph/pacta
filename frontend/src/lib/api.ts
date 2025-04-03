/**
 * Módulo de utilidad para realizar solicitudes a la API
 */
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

// Crear una instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token de autenticación si existe
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tokenAcceso') || sessionStorage.getItem('tokenAcceso');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Gestionar errores específicos como 401 (no autorizado)
    if (error.response?.status === 401) {
      // Limpiar tokens
      localStorage.removeItem('tokenAcceso');
      localStorage.removeItem('tokenRefresco');
      sessionStorage.removeItem('tokenAcceso');
      sessionStorage.removeItem('tokenRefresco');
      
      // Si no estamos ya en la página de login, redirigir
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Tipos para las respuestas de la API
export type ApiResponse<T> = {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

// Tipo para errores de la API
export type ApiError = {
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
  status?: string;
}

// Funciones auxiliares para llamadas a la API
export const api = {
  // GET
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  // POST
  async post<T, D>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // PUT
  async put<T, D>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // PATCH
  async patch<T, D>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // DELETE
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },
};

// Exportar el API por defecto
export default api; 