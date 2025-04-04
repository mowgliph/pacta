import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
  type QueryKey
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import { handleServerError, handleServerErrorSilent } from '@/utils/handle-server-error';
import { queryClient } from '@/lib/react-query';

/**
 * Hook para realizar una petición GET usando React Query
 * @param url URL del endpoint
 * @param queryKey Clave para almacenamiento en caché
 * @param options Opciones adicionales para React Query
 */
export function useApiGet<TData = unknown>(
  url: string,
  queryKey: QueryKey,
  options?: UseQueryOptions<TData, Error, TData, QueryKey>
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await api.get<TData>(url);
      } catch (error) {
        throw handleServerErrorSilent(error);
      }
    },
    ...options
  });
}

/**
 * Hook para realizar una petición POST usando React Query
 * @param url URL del endpoint
 * @param options Opciones adicionales para React Query
 */
export function useApiPost<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data) => {
      try {
        return await api.post<TData, TVariables>(url, data);
      } catch (error) {
        throw handleServerError(error);
      }
    },
    ...options
  });
}

/**
 * Hook para realizar una petición PUT usando React Query
 * @param url URL del endpoint
 * @param options Opciones adicionales para React Query
 */
export function useApiPut<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data) => {
      try {
        return await api.put<TData, TVariables>(url, data);
      } catch (error) {
        throw handleServerError(error);
      }
    },
    ...options
  });
}

/**
 * Hook para realizar una petición PATCH usando React Query
 * @param url URL del endpoint
 * @param options Opciones adicionales para React Query
 */
export function useApiPatch<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data) => {
      try {
        return await api.patch<TData, TVariables>(url, data);
      } catch (error) {
        throw handleServerError(error);
      }
    },
    ...options
  });
}

/**
 * Hook para realizar una petición DELETE usando React Query
 * @param url URL del endpoint
 * @param options Opciones adicionales para React Query
 */
export function useApiDelete<TData = unknown>(
  url: string,
  options?: UseMutationOptions<TData, Error, string>
) {
  return useMutation<TData, Error, string>({
    mutationFn: async (id) => {
      try {
        // Construir URL completa con ID
        const fullUrl = `${url}${url.endsWith('/') ? '' : '/'}${id}`;
        return await api.delete<TData>(fullUrl);
      } catch (error) {
        throw handleServerError(error);
      }
    },
    ...options
  });
}

/**
 * Función para invalidar consultas relacionadas
 * @param queryKeys Claves de consulta a invalidar
 */
export function invalidateRelatedQueries(queryKeys: QueryKey[]) {
  queryKeys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}

/**
 * Utilidad para prefetch de datos
 * @param queryKey Clave de la consulta
 * @param queryFn Función para obtener los datos
 */
export function prefetchQuery<TData>(queryKey: QueryKey, queryFn: () => Promise<TData>) {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn
  });
}

export const useNotifications = () => {
  // Funciones para mostrar diferentes tipos de notificaciones
  return {
    showSuccess: (message: string) => {
      import('@/hooks/useToast').then(({ showSuccess }) => showSuccess(message));
    },
    showError: (message: string) => {
      import('@/hooks/useToast').then(({ showError }) => showError(message));
    },
    showWarning: (message: string) => {
      import('@/hooks/useToast').then(({ showWarning }) => showWarning(message));
    },
    showInfo: (message: string) => {
      import('@/hooks/useToast').then(({ showInfo }) => showInfo(message));
    }
  };
};