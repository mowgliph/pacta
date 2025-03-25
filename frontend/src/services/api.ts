import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { CacheService } from './cache-service';

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

// Configuración de caché para solicitudes
interface CacheConfig {
  useCache?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
  cacheCategory?: string;
}

// Crear instancia de axios con configuración base
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Detector de estado de red
let isOnline = navigator.onLine;
window.addEventListener('online', () => { isOnline = true; });
window.addEventListener('offline', () => { isOnline = false; });

// Interceptor para manejar tokens y caché
api.interceptors.request.use(
  async (config) => {
    // Agregar token de autenticación
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Manejar configuración de caché
    const cacheConfig = config.meta?.cache as CacheConfig;
    
    if (cacheConfig?.useCache && config.method?.toLowerCase() === 'get') {
      // Construir clave de caché basada en URL y parámetros
      const cacheKey = cacheConfig.cacheKey || 
        `${config.url}_${JSON.stringify(config.params || {})}`;
      
      try {
        // Verificar si hay datos en caché
        const cachedData = await CacheService.get(cacheKey);
        
        if (cachedData) {
          // Si estamos offline o la solicitud tiene configuración de caché específica
          if (!isOnline || cacheConfig.useCache) {
            // Marcar la solicitud para que no se realice y usar datos de caché
            config.adapter = () => {
              return Promise.resolve({
                data: cachedData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
                request: { fromCache: true }
              });
            };
          }
        }
      } catch (error) {
        console.error('Error getting cached data:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  async (response) => {
    // Si no es una respuesta de caché, almacenarla en caché si está configurado
    if (!response.request?.fromCache) {
      const cacheConfig = response.config.meta?.cache as CacheConfig;
      
      if (cacheConfig?.useCache && response.config.method?.toLowerCase() === 'get') {
        const cacheKey = cacheConfig.cacheKey || 
          `${response.config.url}_${JSON.stringify(response.config.params || {})}`;
        
        try {
          await CacheService.set(
            cacheKey, 
            response.data, 
            cacheConfig.cacheCategory || 'api', 
            cacheConfig.cacheDuration
          );
        } catch (error) {
          console.error('Error caching response:', error);
        }
      }
    }
    
    return response;
  },
  async (error) => {
    // Si estamos offline, intentar usar caché como fallback
    if (!isOnline && error.config) {
      const cacheConfig = error.config.meta?.cache as CacheConfig;
      
      if (cacheConfig?.useCache && error.config.method?.toLowerCase() === 'get') {
        const cacheKey = cacheConfig.cacheKey || 
          `${error.config.url}_${JSON.stringify(error.config.params || {})}`;
        
        try {
          const cachedData = await CacheService.get(cacheKey);
          
          if (cachedData) {
            console.info(`Using cached data as fallback for ${error.config.url}`);
            return Promise.resolve({
              data: cachedData,
              status: 200,
              statusText: 'OK (from cache)',
              headers: {},
              config: error.config,
              request: { fromCache: true }
            });
          }
        } catch (cacheError) {
          console.error('Error getting cached data for fallback:', cacheError);
        }
      }
    }
    
    // Manejar error de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Método para hacer solicitudes con caché
export const apiCache = {
  get: <T = any>(
    url: string, 
    params?: any, 
    cacheConfig?: CacheConfig
  ): Promise<AxiosResponse<T>> => {
    return api.get<T>(url, { 
      params, 
      meta: { 
        cache: { 
          useCache: true, 
          ...cacheConfig 
        } 
      } 
    });
  }
};

export default api;