import { QueryClient } from '@tanstack/react-query';

// Crear un cliente de consulta para React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // No recargar datos automáticamente al volver a la ventana
      retry: 1, // Intentar una vez más si falla una consulta
      staleTime: 5 * 60 * 1000, // Considerar datos frescos durante 5 minutos
    },
  },
});

// Función para invalidar cachés relacionadas
export const invalidateRelatedQueries = async (queryKeys: string[]) => {
  const promises = queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  await Promise.all(promises);
};

// Función para prefetch de datos
export const prefetchQuery = async <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    gcTime?: number; // Reemplaza cacheTime
  }
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });
};

// Constantes para tiempos de caché
export const CACHE_TIMES = {
  SHORT: 2 * 60 * 1000, // 2 minutos
  MEDIUM: 5 * 60 * 1000, // 5 minutos
  LONG: 15 * 60 * 1000, // 15 minutos
  EXTENDED: 30 * 60 * 1000, // 30 minutos
  VERY_LONG: 60 * 60 * 1000, // 1 hora
}; 