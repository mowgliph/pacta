import { useSwrHelper, usePagination, usePost, usePut, useDelete, useGet } from '@/lib/api/swr-hooks';
import { Contract, ContractsResponse, ContractSearchParams, CreateContractData, Supplement, Attachment } from '../services/contracts-service';

/**
 * Hook para obtener una lista de contratos con paginación y filtros
 */
export function useContracts(params: ContractSearchParams = {}) {
  const url = `/contracts`;
  const { data, error, isLoading, mutate } = useGet<ContractsResponse>(
    Object.keys(params).length 
      ? `${url}?${new URLSearchParams(params as Record<string, string>).toString()}`
      : url
  );

  return {
    contracts: data?.data || [],
    pagination: {
      total: data?.total || 0,
      page: data?.page || 1,
      limit: data?.limit || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    mutate
  };
}

/**
 * Hook para buscar contratos por término
 */
export function useSearchContracts(searchTerm: string, params: ContractSearchParams = {}) {
  const searchParams = searchTerm ? { ...params, search: searchTerm } : params;
  const url = `/contracts`;
  const queryString = Object.keys(searchParams).length 
    ? `?${new URLSearchParams(searchParams as Record<string, string>).toString()}`
    : '';
  
  const { data, error, isLoading, mutate } = useGet<ContractsResponse>(
    searchTerm ? `${url}${queryString}` : null
  );

  return {
    contracts: data?.data || [],
    pagination: {
      total: data?.total || 0,
      page: data?.page || 1,
      limit: data?.limit || 10,
      totalPages: data?.totalPages || 1
    },
    isLoading,
    error,
    mutate
  };
}

/**
 * Hook para obtener un contrato específico por ID
 */
export function useContract(id: string | null) {
  return useSwrHelper<Contract>(
    id ? `/contracts/${id}` : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minuto
    }
  );
}

/**
 * Hook para obtener contratos por vencer pronto
 */
export function useExpiringContracts(days = 30, limit = 5) {
  return useSwrHelper<Contract[]>(
    `/contracts/expiring?days=${days}&limit=${limit}`,
    {
      revalidateOnFocus: false, 
      dedupingInterval: 5 * 60 * 1000, // 5 minutos
    }
  );
}

/**
 * Hook para crear un nuevo contrato
 */
export function useCreateContract() {
  return usePost<CreateContractData, Contract>('/contracts');
}

/**
 * Hook para actualizar un contrato existente
 */
export function useUpdateContract(id: string) {
  return usePut<Partial<CreateContractData>, Contract>(`/contracts/${id}`);
}

/**
 * Hook para eliminar un contrato
 */
export function useDeleteContract(id: string) {
  return useDelete<{ success: boolean }>(`/contracts/${id}`);
}

/**
 * Hook para obtener los adjuntos de un contrato
 */
export function useContractAttachments(contractId: string | null) {
  return useSwrHelper<Attachment[]>(
    contractId ? `/contracts/${contractId}/attachments` : null
  );
}

/**
 * Hook para obtener los suplementos de un contrato
 */
export function useContractSupplements(contractId: string | null) {
  return useSwrHelper<Supplement[]>(
    contractId ? `/contracts/${contractId}/supplements` : null
  );
}

/**
 * Hook para subir un adjunto
 */
export function useUploadAttachment(contractId: string) {
  return usePost<FormData, Attachment>(`/contracts/${contractId}/attachments`);
}

/**
 * Hook para crear un suplemento
 */
export function useCreateSupplement(contractId: string) {
  return usePost<FormData, Supplement>(`/contracts/${contractId}/supplements`);
} 