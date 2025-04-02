import { SWRConfiguration } from 'swr';
import axios from 'axios';

// Verificar si estamos en el navegador
const isClient = typeof window !== 'undefined';

// Instancia de API para SWR
// Recreamos la misma configuración que en api/index.ts para evitar una importación circular
const apiInstance = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
apiInstance.interceptors.request.use(
  (config) => {
    if (isClient) {
      const token = localStorage.getItem(process.env.AUTH_STORAGE_KEY || 'pacta_auth');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configuración global para SWR
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  shouldRetryOnError: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
};

// Fetcher predeterminado usando la instancia API configurada
export const fetcher = async (url: string) => {
  const response = await apiInstance.get(url);
  return response.data;
};

// Fetcher con parámetros
export const fetcherWithParams = async ([url, params]: [string, Record<string, any>]) => {
  const response = await apiInstance.get(url, { params });
  return response.data;
};

// Fetcher con token de autenticación (ya no es necesario agregar el token manualmente)
export const fetcherWithAuth = async (url: string) => {
  const response = await apiInstance.get(url);
  return response.data;
};

// Fetcher para métodos POST
export const postFetcher = async (url: string, { arg }: { arg: any }) => {
  const response = await apiInstance.post(url, arg);
  return response.data;
};

// Fetcher para métodos PUT
export const putFetcher = async (url: string, { arg }: { arg: any }) => {
  const response = await apiInstance.put(url, arg);
  return response.data;
};

// Fetcher para métodos DELETE
export const deleteFetcher = async (url: string) => {
  const response = await apiInstance.delete(url);
  return response.data;
};

// Utilidad para crear una clave de caché compuesta
export const createSWRKey = (baseKey: string, params?: Record<string, any>) => {
  if (!params) return baseKey;
  return [baseKey, params];
}; 