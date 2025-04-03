import { useState, useCallback, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  ContractService, 
  type Contract, 
  type Supplement, 
  type ContractSearchParams, 
  type CreateContractData, 
  type Pagination, 
  type ContractAttachment, 
  type SearchResponse
} from '../services/contracts-service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Claves de query para la caché
const QUERY_KEYS = {
  contracts: 'contracts',
  contract: (id: string) => ['contract', id],
  supplements: (contractId: string) => ['supplements', contractId],
  attachments: (contractId: string) => ['attachments', contractId]
};

// Hook para buscar contratos con filtros
export const useSearchContracts = (searchTerm: string, params: ContractSearchParams) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Función para cargar los datos
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ContractService.searchContracts(searchTerm, params);
      setContracts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, params]);
  
  // Función para recargar los datos
  const mutate = useCallback(() => {
    return fetchData();
  }, [fetchData]);
  
  // Efecto para cargar los datos iniciales
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { contracts, pagination, isLoading, error, mutate };
};

/**
 * Hook para obtener un contrato por su ID
 */
export function useContract(id: string) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.contract(id),
    queryFn: () => ContractService.getContract(id),
    enabled: !!id
  });

  return {
    data,
    isLoading,
    error,
    mutate: refetch
  };
}

// Hook para crear un contrato
export const useCreateContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Función para crear el contrato
  const execute = useCallback(async (data: CreateContractData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ContractService.createContract(data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { execute, isLoading, error };
};

// Hook para actualizar un contrato
export const useUpdateContract = (id: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Función para actualizar el contrato
  const execute = useCallback(async (data: CreateContractData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ContractService.updateContract(id, data);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [id]);
  
  return { execute, isLoading, error };
};

// Hook para eliminar un contrato
export const useDeleteContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Función para eliminar el contrato
  const execute = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await ContractService.deleteContract(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { execute, isLoading, error };
};

/**
 * Hook para obtener los suplementos de un contrato
 */
export function useContractSupplements(contractId: string) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.supplements(contractId),
    queryFn: () => ContractService.getContractSupplements(contractId),
    enabled: !!contractId
  });

  return {
    data,
    isLoading,
    error,
    mutate: refetch
  };
}

// Hook para obtener un suplemento por ID
export const useSupplement = (id: string) => {
  const [data, setData] = useState<Supplement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Función para cargar los datos
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supplement = await ContractService.getSupplement(id);
      setData(supplement);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);
  
  // Función para recargar los datos
  const mutate = useCallback(() => {
    return fetchData();
  }, [fetchData]);
  
  // Efecto para cargar los datos iniciales
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data, isLoading, error, mutate };
};

// Hook para crear un suplemento
export const useCreateSupplement = (contractId: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  
  const mutation = useMutation({
    mutationFn: (formData: FormData) => ContractService.createSupplement(contractId, formData),
    onSuccess: () => {
      showSuccess('Suplemento creado correctamente');
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supplements(contractId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contract(contractId) });
    },
    onError: () => {
      showError('Error al crear el suplemento');
    }
  });
  
  return { 
    execute: mutation.mutate, 
    isLoading: mutation.isPending, 
    error: mutation.error 
  };
};

// Hook para actualizar un suplemento
export const useUpdateSupplement = (id: string, contractId: string) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotifications();
  
  const mutation = useMutation({
    mutationFn: (formData: FormData) => ContractService.updateSupplement(id, formData),
    onSuccess: () => {
      showSuccess('Suplemento actualizado correctamente');
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supplements(contractId) });
    },
    onError: () => {
      showError('Error al actualizar el suplemento');
    }
  });
  
  return { 
    execute: mutation.mutate, 
    isLoading: mutation.isPending, 
    error: mutation.error 
  };
};

// Hook para eliminar un suplemento
export const useDeleteSupplement = (contractId: string) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (id: string) => ContractService.deleteSupplement(id),
    onSuccess: () => {
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supplements(contractId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contract(contractId) });
    }
  });
  
  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error
  };
};

/**
 * Hook para obtener los adjuntos de un contrato
 */
export function useContractAttachments(contractId: string) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.attachments(contractId),
    queryFn: () => ContractService.getContractAttachments(contractId),
    enabled: !!contractId
  });

  return {
    data,
    isLoading,
    error,
    mutate: refetch
  };
}

/**
 * Hook para obtener la lista de contratos con filtros
 */
export function useContracts(filters: Partial<ContractSearchParams> = {}) {
  const defaultParams: ContractSearchParams = {
    page: 1,
    limit: 10,
    ...filters
  };
  
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.contracts, JSON.stringify(defaultParams)],
    queryFn: () => ContractService.searchContracts('', defaultParams),
  });

  return {
    data: data?.data,
    pagination: data?.pagination,
    isLoading,
    error,
    mutate: refetch
  };
}

/**
 * Hook para obtener estadísticas de contratos por tipo
 */
export function useContractStatsByType() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['contractStats', 'byType'],
    queryFn: () => ContractService.getContractStatsByType(),
  });

  return {
    data,
    isLoading,
    error,
    mutate: refetch
  };
} 