import { useState } from 'react';
import useSWR, { SWRConfiguration, useSWRConfig } from 'swr';

// Fetchers para SWR
const fetcher = async (url: string) => {
  if (!url) return null;
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('Error en la petición API') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return response.json();
};

const fetcherWithParams = async ([url, params]: [string, any]) => {
  const queryParams = new URLSearchParams();
  for (const key in params) {
    queryParams.append(key, params[key]);
  }
  const queryString = queryParams.toString();
  const fullUrl = `${url}${queryString ? `?${queryString}` : ''}`;
  
  return fetcher(fullUrl);
};

const postFetcher = async (url: string, { arg }: { arg: any }) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  
  if (!response.ok) {
    const error = new Error('Error en la petición API') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  
  return response.json();
};

const putFetcher = async (url: string, { arg }: { arg: any }) => {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });
  
  if (!response.ok) {
    const error = new Error('Error en la petición API') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  
  return response.json();
};

const deleteFetcher = async (url: string) => {
  const response = await fetch(url, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = new Error('Error en la petición API') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  
  return response.json();
};

/**
 * Hook para obtener recursos (GET) con SWR
 */
export function useGet<T>(url: string | null, options?: SWRConfiguration) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    url,
    fetcher,
    options
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    isError: !!error,
    isSuccess: !!data && !error,
  };
}

/**
 * Hook para gestionar estados de carga y error
 * Útil para adaptar componentes que antes usaban TanStack Query
 */
export function useSwrHelper<T>(key: string | null, options?: SWRConfiguration) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key, 
    fetcher, 
    options
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    isError: !!error,
    isSuccess: !!data && !error,
  };
}

/**
 * Hook para gestionar paginación con SWR
 */
export function usePagination<T>(
  baseUrl: string,
  page: number = 1,
  limit: number = 10,
  options?: SWRConfiguration
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }>(
    [baseUrl, { page, limit }],
    fetcherWithParams,
    options
  );

  const hasNextPage = !!data && data.currentPage < data.totalPages;
  const hasPreviousPage = !!data && data.currentPage > 1;

  return {
    data: data?.items,
    meta: {
      totalItems: data?.totalItems || 0,
      totalPages: data?.totalPages || 0,
      currentPage: data?.currentPage || page,
    },
    error,
    isLoading,
    isValidating,
    mutate,
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Hook para crear recursos (POST) con SWR
 */
export function usePost<T, R = any>(url: string) {
  const { mutate } = useSWRConfig();
  const [state, setState] = useState<{
    data: R | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = async (data: T): Promise<R | null> => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const result = await postFetcher(url, { arg: data });
      setState({ data: result, error: null, isLoading: false });
      
      // Invalida todas las claves que comiencen con la URL base
      await mutate((key) => 
        typeof key === 'string' && key.startsWith(url.split('/').slice(0, -1).join('/')), 
        undefined, 
        { revalidate: true }
      );
      
      return result;
    } catch (error) {
      setState({ 
        data: null, 
        error: error instanceof Error ? error : new Error('Error en la petición'), 
        isLoading: false 
      });
      return null;
    }
  };

  return {
    ...state,
    execute,
  };
}

/**
 * Hook para actualizar recursos (PUT) con SWR
 */
export function usePut<T, R = any>(url: string) {
  const { mutate } = useSWRConfig();
  const [state, setState] = useState<{
    data: R | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = async (data: T): Promise<R | null> => {
    setState({ data: null, error: null, isLoading: true });
    try {
      const result = await putFetcher(url, { arg: data });
      setState({ data: result, error: null, isLoading: false });
      
      // Invalida la URL específica y cualquier colección relacionada
      await mutate(url);
      await mutate((key) => 
        typeof key === 'string' && key.startsWith(url.split('/').slice(0, -1).join('/')),
        undefined,
        { revalidate: true }
      );
      
      return result;
    } catch (error) {
      setState({ 
        data: null, 
        error: error instanceof Error ? error : new Error('Error en la petición'), 
        isLoading: false 
      });
      return null;
    }
  };

  return {
    ...state,
    execute,
  };
}

/**
 * Hook para eliminar recursos (DELETE) con SWR
 */
export function useDelete<R = any>(url: string) {
  const { mutate } = useSWRConfig();
  const [state, setState] = useState<{
    data: R | null;
    error: Error | null;
    isLoading: boolean;
  }>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = async (id: string): Promise<R | null> => {
    const deleteUrl = `${url}/${id}`;
    setState({ data: null, error: null, isLoading: true });
    try {
      const result = await deleteFetcher(deleteUrl);
      setState({ data: result, error: null, isLoading: false });
      
      // Invalida cualquier colección relacionada
      await mutate((key) => 
        typeof key === 'string' && key.startsWith(url),
        undefined,
        { revalidate: true }
      );
      
      return result;
    } catch (error) {
      setState({ 
        data: null, 
        error: error instanceof Error ? error : new Error('Error en la petición'), 
        isLoading: false 
      });
      return null;
    }
  };

  return {
    ...state,
    execute,
  };
} 