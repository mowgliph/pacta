import axios from 'axios';
import type { Contract } from '@/stores/contract';

export interface ContractFilter {
  title?: string;
  contractNumber?: string;
  status?: string | string[];
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
}

interface ContractStatistics {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  expiredContracts: number;
  // Agrega valores monetarios totales por moneda
  totalByCurrency: {
    CUP?: number;
    USD?: number;
    EUR?: number;
  };
}

interface ContractStatusCounts {
  active: number;
  expired: number;
  draft: number;
  terminated: number;
  renewed: number;
}

export interface ContractStatisticsResponse {
  stats: ContractStatistics;
  statusCounts: ContractStatusCounts;
  recentContracts: Contract[];
}

class ContractService {
  async getContracts(filters?: ContractFilter): Promise<Contract[]> {
    try {
      // Manejo de filtros como parámetros de consulta si es necesario
      const params = filters ? { ...filters } : {};
      const response = await axios.get('/api/contracts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw new Error('No se pudieron cargar los contratos. Por favor, inténtelo de nuevo.');
    }
  }

  async getContract(id: number): Promise<Contract> {
    try {
      const response = await axios.get(`/api/contracts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching contract ${id}:`, error);
      throw new Error('No se pudo cargar el contrato solicitado.');
    }
  }

  async createContract(contractData: Partial<Contract>): Promise<Contract> {
    try {
      const response = await axios.post('/api/contracts', contractData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating contract:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        // Manejar errores de validación del servidor
        const validationErrors = error.response.data.errors;
        throw new Error(validationErrors.map((err: any) => `${err.message}`).join(', '));
      }
      throw new Error('No se pudo crear el contrato. Por favor, revise los datos e inténtelo de nuevo.');
    }
  }

  async updateContract(id: number, contractData: Partial<Contract>): Promise<Contract> {
    try {
      const response = await axios.put(`/api/contracts/${id}`, contractData);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating contract ${id}:`, error);
      if (error.response && error.response.data && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        throw new Error(validationErrors.map((err: any) => `${err.message}`).join(', '));
      }
      throw new Error('No se pudo actualizar el contrato.');
    }
  }

  async deleteContract(id: number): Promise<void> {
    try {
      await axios.delete(`/api/contracts/${id}`);
    } catch (error) {
      console.error(`Error deleting contract ${id}:`, error);
      throw new Error('No se pudo eliminar el contrato.');
    }
  }

  async getContractStatistics(): Promise<ContractStatisticsResponse> {
    try {
      const response = await axios.get('/api/contracts/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching contract statistics:', error);
      throw new Error('No se pudieron cargar las estadísticas de contratos.');
    }
  }

  // Método para filtrar contratos localmente (útil para búsquedas instantáneas)
  filterContracts(contracts: Contract[], filter: ContractFilter): Contract[] {
    return contracts.filter(contract => {
      // Filtro por título
      if (filter.title && !contract.title.toLowerCase().includes(filter.title.toLowerCase())) {
        return false;
      }
      
      // Filtro por número de contrato
      if (filter.contractNumber && !contract.contractNumber.toLowerCase().includes(filter.contractNumber.toLowerCase())) {
        return false;
      }
      
      // Filtro por estado
      if (filter.status) {
        if (Array.isArray(filter.status)) {
          if (!filter.status.includes(contract.status)) {
            return false;
          }
        } else if (contract.status !== filter.status) {
          return false;
        }
      }
      
      // Filtro por fecha de inicio (desde)
      if (filter.startDateFrom && new Date(contract.startDate) < new Date(filter.startDateFrom)) {
        return false;
      }
      
      // Filtro por fecha de inicio (hasta)
      if (filter.startDateTo && new Date(contract.startDate) > new Date(filter.startDateTo)) {
        return false;
      }
      
      // Filtro por fecha de fin (desde)
      if (filter.endDateFrom && new Date(contract.endDate) < new Date(filter.endDateFrom)) {
        return false;
      }
      
      // Filtro por fecha de fin (hasta)
      if (filter.endDateTo && new Date(contract.endDate) > new Date(filter.endDateTo)) {
        return false;
      }
      
      return true;
    });
  }
}

export const contractService = new ContractService(); 