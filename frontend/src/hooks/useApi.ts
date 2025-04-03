import { 
  useQuery, 
  useMutation, 
  type UseQueryOptions, 
  type UseMutationOptions,
  type QueryKey
} from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '@/lib/react-query';
import { API_CONFIG } from '@/config/api';

// Crea instancia de axios con configuración base
const api = axios.create({
  baseURL: API_CONFIG.baseURL || 'http://localhost:3001/api',
  headers: API_CONFIG.headers,
  timeout: API_CONFIG.timeout,
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Maneja errores de autenticación
    if (error.response?.status === 401) {
      // Si no estamos en una ruta de autenticación, limpiar token
      if (!window.location.pathname.includes('/auth/')) {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Hook para peticiones GET
export function useApiGet<TData = unknown>(
  url: string,
  queryKey: QueryKey,
  options?: UseQueryOptions<TData, Error, TData, QueryKey>
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get(url);
      return response as TData;
    },
    ...options,
  });
}

// Hook para peticiones POST
export function useApiPost<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const response = await api.post(url, variables);
      return response as TData;
    },
    ...options,
  });
}

// Hook para peticiones PUT
export function useApiPut<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const response = await api.put(url, variables);
      return response as TData;
    },
    ...options,
  });
}

// Hook para peticiones PATCH
export function useApiPatch<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const response = await api.patch(url, variables);
      return response as TData;
    },
    ...options,
  });
}

// Hook para peticiones DELETE
export function useApiDelete<TData = unknown>(
  url: string,
  options?: UseMutationOptions<TData, Error, string>
) {
  return useMutation<TData, Error, string>({
    mutationFn: async (id) => {
      const response = await api.delete(`${url}/${id}`);
      return response as TData;
    },
    ...options,
  });
}

// Exportar la instancia de axios para uso directo
export { api }; 