import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService, supplementService, statisticsService } from '@/renderer/services';

// Hooks para contratos
export const useContracts = (filters = {}) => {
  return useQuery({
    queryKey: ['contracts', filters],
    queryFn: () => contractService.getAllContracts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useContractDetails = (contractId) => {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => contractService.getContractDetails(contractId),
    enabled: !!contractId,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contractService.createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => contractService.updateContract(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contractService.deleteContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

// Hooks para suplementos
export const useAddSupplement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, data }) => supplementService.addSupplement(contractId, data),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
    },
  });
};

export const useEditSupplement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, supplementId, data }) => 
      supplementService.editSupplement(contractId, supplementId, data),
    onSuccess: (_, { contractId }) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
    },
  });
};

// Hooks para estadísticas
export const useStatistics = () => {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: () => statisticsService.getGeneralStatistics(),
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}; 