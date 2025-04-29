import { useState } from "react";
import { toast } from "sonner";
import {
  Contract,
  ContractStatus,
  ContractFilters,
  ContractStats,
} from "../types/contract";
import { useAuth } from "../context/AuthContext";
import { contractsApi } from "../api/contracts";

/**
 * Hook para la gestión de contratos
 */
export function useContracts() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Obtiene la lista de contratos con filtros opcionales
   */
  const getContracts = async (
    filters?: ContractFilters
  ): Promise<Contract[]> => {
    setIsLoading(true);
    try {
      const data = await contractsApi.getContracts(user?.id || "");
      return data;
    } catch (error) {
      toast.error("Error al cargar los contratos");
      console.error(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene un contrato por su ID
   */
  const getContractById = async (id: string): Promise<Contract | null> => {
    setIsLoading(true);
    try {
      const data = await contractsApi.getContractById(id, user?.id || "");
      return data;
    } catch (error) {
      toast.error("Error al cargar el contrato");
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crea un nuevo contrato
   */
  const createContract = async (newContract: {
    title: string;
    description?: string;
    type?: string;
    startDate: string | Date;
    endDate?: string | Date;
    status: string;
    amount?: number;
    currency?: string;
    parties?: Array<{ name: string; role: string; contact?: string }>;
    tags?: string;
    metadata?: Record<string, any>;
  }): Promise<Contract | null> => {
    setIsLoading(true);
    try {
      const data = await contractsApi.createContract(
        newContract,
        user?.id || ""
      );
      toast.success("Contrato creado correctamente");
      return data;
    } catch (error) {
      toast.error("Error al crear el contrato");
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualiza un contrato existente
   */
  const updateContract = async (
    id: string,
    contractData: Partial<Contract>
  ): Promise<Contract | null> => {
    setIsLoading(true);
    try {
      const data = await contractsApi.updateContract(
        id,
        contractData,
        user?.id || ""
      );
      toast.success("Contrato actualizado correctamente");
      return data;
    } catch (error) {
      toast.error("Error al actualizar el contrato");
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Elimina un contrato
   */
  const deleteContract = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await contractsApi.deleteContract(id, user?.id || "");
      toast.success("Contrato eliminado correctamente");
      return true;
    } catch (error) {
      toast.error("Error al eliminar el contrato");
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtiene estadísticas de contratos
   */
  const getContractStats = async (): Promise<ContractStats | null> => {
    setIsLoading(true);
    try {
      const contracts = await getContracts();
      const stats: ContractStats = {
        total: contracts.length,
        byStatus: {
          Vigente: 0,
          "Próximo a Vencer": 0,
          Vencido: 0,
          Archivado: 0,
        },
      };

      contracts.forEach((contract) => {
        stats.byStatus[contract.status]++;
      });

      return stats;
    } catch (error) {
      toast.error("Error al cargar estadísticas");
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getContracts,
    getContractById,
    createContract,
    updateContract,
    deleteContract,
    getContractStats,
  };
}
