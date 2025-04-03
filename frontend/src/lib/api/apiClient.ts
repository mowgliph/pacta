import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Creamos una instancia de axios con la configuración por defecto
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a todas las solicitudes
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get(import.meta.env.VITE_AUTH_STORAGE_KEY || 'pacta_auth');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Manejo de errores 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      // Limpiar token
      Cookies.remove(import.meta.env.VITE_AUTH_STORAGE_KEY || 'pacta_auth');
      
      // Redireccionar a login
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API helpers para simplificar las llamadas
export const apiHelpers = {
  get: async <T>(url: string, params?: any): Promise<T> => {
    const response = await api.get<T>(url, { params });
    return response.data;
  },
  
  post: async <T>(url: string, data: any): Promise<T> => {
    const response = await api.post<T>(url, data);
    return response.data;
  },
  
  put: async <T>(url: string, data: any): Promise<T> => {
    const response = await api.put<T>(url, data);
    return response.data;
  },
  
  patch: async <T>(url: string, data: any): Promise<T> => {
    const response = await api.patch<T>(url, data);
    return response.data;
  },
  
  delete: async <T>(url: string): Promise<T> => {
    const response = await api.delete<T>(url);
    return response.data;
  }
}; 