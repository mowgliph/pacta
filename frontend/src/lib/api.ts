/**
 * Módulo de utilidad para realizar solicitudes a la API
 */
import { useStore } from '@/store';

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Tipos de error de la API
export type ApiError = {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
};

// Opciones para las peticiones
type RequestOptions = {
  token?: string;
  params?: Record<string, any>;
} & RequestInit

/**
 * Función para realizar peticiones a la API
 * @param endpoint Endpoint de la API (sin la URL base)
 * @param options Opciones de la petición
 * @returns Resultado de la petición
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, params, ...fetchOptions } = options;
  
  // Construir la URL con query params si existen
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url = `${url}?${searchParams.toString()}`;
  }
  
  // Cabeceras por defecto
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Añadir token de autenticación si existe
  const authToken = token || useStore.getState().token;
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  
  // Realizar la petición
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });
  
  // Comprobar errores HTTP
  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch (error) {
      errorData = {
        message: 'Error de servidor',
        status: response.status,
      };
    }
    
    throw errorData;
  }
  
  // Si la respuesta está vacía, devolver null
  if (response.status === 204) {
    return null as T;
  }
  
  // Parsear la respuesta como JSON
  return await response.json();
}

// Funciones auxiliares para diferentes métodos HTTP
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { method: 'GET', ...options }),
    
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined,
      ...options 
    }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
}; 