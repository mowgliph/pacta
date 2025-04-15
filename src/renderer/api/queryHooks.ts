import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  contractService, 
  supplementService, 
  statisticsService 
} from '@/renderer/services';
import type { Contract as IContract, Supplement as ISupplement } from '@/renderer/types/contracts';

type Contract = IContract;
type Supplement = ISupplement;

interface Statistics {
  contracts: {
    total: number;
    active: number;
    inactive: number;
    expiring: number;
  };
  supplements: {
    totalSupplements: number;
    totalAmount: number;
    averageAmount: number;
  };
  trends: Array<{
    month: string;
    count: number;
  }>;
}

interface ContractFilters {
  status?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}

interface UpdateContractVariables {
  id: string;
  data: Partial<Contract>;
}

interface SupplementVariables {
  contractId: string;
  data: Omit<Supplement, 'id' | 'contractId'>;
}

interface EditSupplementVariables extends SupplementVariables {
  supplementId: string;
}

// Hooks para contratos
export const useContracts = (filters: ContractFilters = {}) => {
  return useQuery<Contract[], Error>({
    queryKey: ['contracts', filters],
    queryFn: () => contractService.getAllContracts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useContractDetails = (contractId: string | undefined) => {
  return useQuery<Contract, Error>({
    queryKey: ['contract', contractId],
    queryFn: () => contractService.getContractDetails(contractId as string),
    enabled: !!contractId,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation<Contract, Error, Partial<Contract>>({
    mutationFn: (data) => contractService.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation<Contract, Error, UpdateContractVariables>({
    mutationFn: ({ id, data }) => contractService.updateContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => contractService.deleteContract(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

// Hooks para suplementos
export const useAddSupplement = () => {
  const queryClient = useQueryClient();
  return useMutation<Supplement, Error, SupplementVariables>({
    mutationFn: ({ contractId, data }) => supplementService.addSupplement(contractId, data),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
    },
  });
};

export const useEditSupplement = () => {
  const queryClient = useQueryClient();
  return useMutation<Supplement, Error, EditSupplementVariables>({
    mutationFn: ({ contractId, supplementId, data }) => 
      supplementService.editSupplement(contractId, supplementId, data),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
    },
  });
};

// Hooks para estadísticas
export const useStatistics = () => {
  return useQuery<Statistics, Error>({
    queryKey: ['statistics'],
    queryFn: () => statisticsService.getGeneralStatistics(),
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
};