import { useState, useCallback, useEffect } from 'react';
import { toast } from './use-toast';
import { contractService } from '@/renderer/services';
import type { Contract, ContractFilters } from '@/renderer/types/contracts';

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async (filters?: ContractFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractService.getAllContracts(filters);
      setContracts(data);
    } catch (err) {
      setError('Error al cargar los contratos');
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los contratos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async (contractData: Partial<Contract>) => {
    try {
      const result = await contractService.createContract(contractData);
      toast({
        title: 'Éxito',
        description: 'Contrato creado exitosamente'
      });
      await fetchContracts();
      return result;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error al crear el contrato',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const handleView = async (contract: Contract) => {
    try {
      const details = await contractService.getContractDetails(contract.id);
      return details;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error al obtener detalles del contrato',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const handleEdit = async (id: string, contractData: Partial<Contract>) => {
    try {
      await contractService.updateContract(id, contractData);
      toast({
        title: 'Éxito',
        description: 'Contrato actualizado exitosamente'
      });
      await fetchContracts();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error al actualizar el contrato',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contractService.deleteContract(id);
      toast({
        title: 'Éxito',
        description: 'Contrato eliminado exitosamente'
      });
      await fetchContracts();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Error al eliminar el contrato',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Cargar contratos al montar el componente
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    error,
    fetchContracts,
    handleCreate,
    handleView,
    handleEdit,
    handleDelete
  };
}