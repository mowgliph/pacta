import axios from 'axios';

// Verifica si estamos en el navegador
const isBrowser = typeof window !== 'undefined';

// Crea una instancia de axios con la configuración por defecto
export const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    // Obtiene el token del localStorage si existe (solo en el navegador)
    const token = isBrowser ? localStorage.getItem(process.env.AUTH_STORAGE_KEY || 'pacta_auth') : null;
    
    // Si el token existe, lo agrega a los headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Maneja errores 401 (No autorizado) - Token expirado o inválido
    if (error.response && error.response.status === 401) {
      // Limpia el token del localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        
        // Redirecciona a la página de login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Funciones helper para llamadas API comunes
export const apiHelpers = {
  get: async (url: string, params?: any) => {
    const response = await api.get(url, { params });
    return response.data;
  },
  
  post: async (url: string, data: any) => {
    const response = await api.post(url, data);
    return response.data;
  },
  
  put: async (url: string, data: any) => {
    const response = await api.put(url, data);
    return response.data;
  },
  
  patch: async (url: string, data: any) => {
    const response = await api.patch(url, data);
    return response.data;
  },
  
  delete: async (url: string) => {
    const response = await api.delete(url);
    return response.data;
  },
};

// Exportar utilidades para SWR
export * from './swrConfig';
export * from './swr-hooks'; 