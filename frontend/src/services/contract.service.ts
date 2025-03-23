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
  searchQuery?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
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

  async searchContracts(filters: ContractFilter): Promise<Contract[]> {
    try {
      const response = await axios.post('/api/contracts/search', filters);
      return response.data;
    } catch (error) {
      console.error('Error searching contracts:', error);
      throw new Error('No se pudieron buscar los contratos con los filtros especificados.');
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

  async createContract(contractData: FormData): Promise<Contract> {
    try {
      const response = await axios.post('/api/contracts', contractData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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

  async updateContract(id: number, contractData: FormData): Promise<Contract> {
    try {
      const response = await axios.put(`/api/contracts/${id}`, contractData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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

  async deleteContract(id: number): Promise<{ message: string, contract: Contract }> {
    try {
      const response = await axios.delete(`/api/contracts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting contract ${id}:`, error);
      throw new Error('No se pudo eliminar el contrato.');
    }
  }

  async getContractDocument(id: number): Promise<Blob> {
    try {
      const response = await axios.get(`/api/contracts/${id}/document`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching contract document ${id}:`, error);
      throw new Error('No se pudo descargar el documento del contrato.');
    }
  }

  async getContractStatistics(): Promise<ContractStatisticsResponse> {
    try {
      const response = await axios.get('/api/contracts/statistics');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching contract statistics:', error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('No se pudieron obtener las estadísticas de contratos');
    }
  }

  async changeContractStatus(id: number, newStatus: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed'): Promise<Contract> {
    try {
      const response = await axios.patch(`/api/contracts/${id}/status`, { status: newStatus });
      return response.data;
    } catch (error: any) {
      console.error(`Error changing contract status:`, error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('No se pudo cambiar el estado del contrato');
    }
  }

  // Método para descargar un documento de contrato
  downloadContractDocument(id: number, fileName?: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.getContractDocument(id)
        .then(blob => {
          // Crear URL para el blob
          const url = window.URL.createObjectURL(blob);
          
          // Crear elemento de enlace para la descarga
          const link = document.createElement('a');
          link.href = url;
          
          // Determinar el nombre del archivo
          const extension = this.getFileExtension(blob.type);
          link.download = fileName || `contrato-${id}${extension}`;
          
          // Añadir al documento, simular clic y limpiar
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Liberar URL
          window.URL.revokeObjectURL(url);
          resolve();
        })
        .catch(error => {
          console.error('Error downloading document:', error);
          if (error.response) {
            if (error.response.status === 404) {
              reject(new Error('El documento solicitado no se encuentra disponible.'));
            } else {
              reject(new Error(`Error al descargar: ${error.response.data.message || 'Error de servidor'}`));
            }
          } else {
            reject(new Error('No se pudo descargar el documento del contrato. Compruebe su conexión a internet.'));
          }
        });
    });
  }

  // Método auxiliar para obtener la extensión del archivo basado en el tipo MIME
  private getFileExtension(mimeType: string): string {
    const mimeTypes: Record<string, string> = {
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
      'text/plain': '.txt'
    };

    return mimeTypes[mimeType] || '';
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
      
      // Filtro por moneda
      if (filter.currency && contract.currency !== filter.currency) {
        return false;
      }
      
      // Filtro por importe mínimo
      if (filter.minAmount !== undefined && contract.amount < filter.minAmount) {
        return false;
      }
      
      // Filtro por importe máximo
      if (filter.maxAmount !== undefined && contract.amount > filter.maxAmount) {
        return false;
      }
      
      // Filtro por búsqueda general
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesTitle = contract.title.toLowerCase().includes(query);
        const matchesNumber = contract.contractNumber.toLowerCase().includes(query);
        const matchesDescription = contract.description?.toLowerCase().includes(query) || false;
        
        if (!matchesTitle && !matchesNumber && !matchesDescription) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Método para preparar datos para crear o actualizar un contrato
  prepareFormData(contractData: any, document?: File | null): FormData {
    const formData = new FormData();
    
    // Añadir todos los campos del contrato
    Object.keys(contractData).forEach(key => {
      if (contractData[key] !== undefined && contractData[key] !== null) {
        formData.append(key, contractData[key]);
      }
    });
    
    // Añadir el documento si existe
    if (document) {
      formData.append('document', document);
    }
    
    return formData;
  }
}

export const contractService = new ContractService(); 