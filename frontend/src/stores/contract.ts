import { defineStore } from 'pinia';
import { contractService } from '@/services/contract.service';
import type { ContractFilter } from '@/services/contract.service';

export interface Contract {
  id: number;
  title: string;
  contractNumber: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
  notificationDays: number;
  amount: number;
  currency: string;
  documentPath?: string;
  createdBy: number;
  lastModifiedBy?: number;
  createdAt?: string;
  updatedAt?: string;
  creator?: {
    id: number;
    username: string;
    email: string;
  };
  modifier?: {
    id: number;
    username: string;
    email: string;
  };
}

interface ContractState {
  contracts: Contract[];
  filteredContracts: Contract[];
  currentContract: Contract | null;
  loading: boolean;
  error: string | null;
  documentLoading: boolean;
}

interface ContractStats {
  active: number;
  expiringSoon: number;
  expired: number;
  totalByCurrency?: {
    CUP?: number;
    USD?: number;
    EUR?: number;
  };
}

export const useContractStore = defineStore('contract', {
  state: (): ContractState => ({
    contracts: [],
    filteredContracts: [],
    currentContract: null,
    loading: false,
    error: null,
    documentLoading: false
  }),

  getters: {
    activeContracts: (state) => 
      state.contracts.filter(c => c.status === 'active'),
    
    expiringContracts: (state) => 
      state.contracts.filter(c => {
        const daysUntilExpiry = Math.ceil(
          (new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return c.status === 'active' && daysUntilExpiry <= c.notificationDays;
      }),
    
    hasDocument: (state) => 
      state.currentContract?.documentPath ? true : false
  },

  actions: {
    setLoading(value: boolean) {
      this.loading = value;
    },
    
    setDocumentLoading(value: boolean) {
      this.documentLoading = value;
    },
    
    async fetchContracts() {
      this.loading = true;
      this.error = null;
      try {
        const contracts = await contractService.getContracts();
        this.contracts = contracts;
        this.filteredContracts = [...contracts];
        return contracts;
      } catch (error: any) {
        this.error = error.message || 'Error fetching contracts';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchContractsWithFilters(filters: ContractFilter) {
      this.loading = true;
      this.error = null;
      try {
        const contracts = await contractService.searchContracts(filters);
        this.filteredContracts = contracts;
        return contracts;
      } catch (error: any) {
        this.error = error.message || 'Error fetching filtered contracts';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchContractById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const contract = await contractService.getContract(id);
        this.currentContract = contract;
        return contract;
      } catch (error: any) {
        this.error = error.message || 'Error fetching contract details';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createContract(contractData: any, document?: File | null) {
      this.loading = true;
      this.error = null;
      try {
        const formData = contractService.prepareFormData(contractData, document);
        const newContract = await contractService.createContract(formData);
        
        // Actualizar la lista de contratos
        this.contracts.unshift(newContract);
        this.filteredContracts.unshift(newContract);
        
        return newContract;
      } catch (error: any) {
        this.error = error.message || 'Error creating contract';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateContract(id: number, contractData: Partial<Contract>, document?: File | null) {
      this.loading = true;
      this.error = null;
      try {
        const formData = contractService.prepareFormData(contractData, document);
        const updatedContract = await contractService.updateContract(id, formData);
        
        // Actualizar en la lista principal
        const index = this.contracts.findIndex(c => c.id === id);
        if (index !== -1) {
          this.contracts[index] = updatedContract;
        }
        
        // Actualizar en la lista filtrada
        const filteredIndex = this.filteredContracts.findIndex(c => c.id === id);
        if (filteredIndex !== -1) {
          this.filteredContracts[filteredIndex] = updatedContract;
        }
        
        // Actualizar el contrato actual si es el mismo
        if (this.currentContract && this.currentContract.id === id) {
          this.currentContract = updatedContract;
        }
        
        return updatedContract;
      } catch (error: any) {
        this.error = error.message || 'Error updating contract';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteContract(id: number) {
      this.loading = true;
      this.error = null;
      try {
        const result = await contractService.deleteContract(id);
        
        // Eliminar de las listas
        this.contracts = this.contracts.filter(c => c.id !== id);
        this.filteredContracts = this.filteredContracts.filter(c => c.id !== id);
        
        // Si el contrato actual es el que se elimina, limpiarlo
        if (this.currentContract && this.currentContract.id === id) {
          this.currentContract = null;
        }
        
        return result;
      } catch (error: any) {
        this.error = error.message || 'Error deleting contract';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async downloadContractDocument(id: number, fileName?: string) {
      this.documentLoading = true;
      try {
        await contractService.downloadContractDocument(id, fileName);
        return Promise.resolve();
      } catch (error: any) {
        this.error = error.message || 'Error downloading document';
        return Promise.reject(error);
      } finally {
        this.documentLoading = false;
      }
    },

    async changeContractStatus(id: number, newStatus: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed') {
      this.loading = true;
      this.error = null;
      try {
        const updatedContract = await contractService.changeContractStatus(id, newStatus);
        
        // Actualizar en las listas
        const index = this.contracts.findIndex(c => c.id === id);
        if (index !== -1) {
          this.contracts[index] = { ...this.contracts[index], status: newStatus };
        }
        
        const filteredIndex = this.filteredContracts.findIndex(c => c.id === id);
        if (filteredIndex !== -1) {
          this.filteredContracts[filteredIndex] = { ...this.filteredContracts[filteredIndex], status: newStatus };
        }
        
        // Si el contrato actual es el que se modifica, actualizarlo
        if (this.currentContract && this.currentContract.id === id) {
          this.currentContract = { ...this.currentContract, status: newStatus };
        }
        
        return updatedContract;
      } catch (error: any) {
        this.error = error.message || 'Error updating contract status';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getContractStats(): Promise<ContractStats> {
      try {
        this.loading = true;
        const response = await contractService.getContractStatistics();
        return {
          active: response.stats.activeContracts,
          expiringSoon: response.stats.expiringContracts,
          expired: response.stats.expiredContracts,
          totalByCurrency: response.stats.totalByCurrency
        };
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch contract statistics';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    clearCurrentContract() {
      this.currentContract = null;
    }
  }
});