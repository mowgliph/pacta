import { useState, useCallback } from "react";
import { Contract } from "./useContracts";
import { ArchivedContract } from "@/types/contracts";

// Definir la interfaz para la respuesta de la API
interface PaginatedResponse<T> {
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  success: boolean;
  error?: {
    message: string;
    code: string;
  };
}

export function useArchivedContracts() {
  const [archivedContracts, setArchivedContracts] = useState<ArchivedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (!error || typeof error !== 'object') return 'Error desconocido al cargar los contratos archivados';
    
    // Manejar error anidado
    const nestedError = error as { error?: { message?: unknown } };
    if (nestedError.error && typeof nestedError.error === 'object') {
      if (nestedError.error.message) {
        return String(nestedError.error.message);
      }
    }
    
    // Intentar obtener el mensaje de error de la respuesta
    const responseError = error as { response?: { data?: { message?: string } } };
    if (responseError?.response?.data?.message) {
      return responseError.response.data.message;
    }
    
    return 'Error desconocido al cargar los contratos archivados';
  };

  const fetchArchivedContracts = useCallback(async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window.electron === 'undefined') {
        throw new Error('Electron no está disponible');
      }

      const response = await window.electron.ipcRenderer.invoke(
        'contracts:list-archived',
        { page, limit, search }
      ) as PaginatedResponse<ArchivedContract>;

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al cargar los contratos archivados');
      }

      const { data } = response;
      setArchivedContracts(data.items);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });

      return { contracts: data.items, total: data.total, page: data.page, limit: data.limit, totalPages: data.totalPages };
    } catch (err) {
      console.error('Error al cargar contratos archivados:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveContract = async (contractId: string) => {
    try {
      setLoading(true);
      
      const response = await window.electron.ipcRenderer.invoke(
        'contracts:get-archived',
        contractId
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al archivar el contrato');
      }

      // Actualizar la lista de contratos archivados
      await fetchArchivedContracts(pagination.page, pagination.limit);
      
      return response.data;
    } catch (err) {
      console.error('Error al archivar contrato:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const restoreContract = async (contractId: string) => {
    try {
      setLoading(true);
      
      const response = await window.electron.ipcRenderer.invoke(
        'contracts:restore',
        contractId
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al restaurar el contrato');
      }

      // Actualizar la lista de contratos archivados
      await fetchArchivedContracts(pagination.page, pagination.limit);
      
      return response.data;
    } catch (err) {
      console.error('Error al restaurar contrato:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    archivedContracts,
    loading,
    error,
    pagination,
    fetchArchivedContracts,
    archiveContract,
    restoreContract,
  };
}
