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
}

interface ContractState {
  contracts: Contract[];
  filteredContracts: Contract[];
  loading: boolean;
  error: string | null;
}

interface ContractStats {
  active: number;
  expiringSoon: number;
  expired: number;
}

export const useContractStore = defineStore('contract', {
  state: (): ContractState => ({
    contracts: [],
    filteredContracts: [],
    loading: false,
    error: null
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
      })
  },

  actions: {
    setLoading(value: boolean) {
      this.loading = value;
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
        const contracts = await contractService.getContracts(filters);
        this.filteredContracts = contracts;
        return contracts;
      } catch (error: any) {
        this.error = error.message || 'Error fetching filtered contracts';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createContract(contractData: Partial<Contract>) {
      try {
        const newContract = await contractService.createContract(contractData);
        this.contracts.push(newContract);
        this.filteredContracts.push(newContract);
        return newContract;
      } catch (error: any) {
        this.error = error.message || 'Error creating contract';
        throw error;
      }
    },

    async updateContract(id: number, contractData: Partial<Contract>) {
      try {
        const updatedContract = await contractService.updateContract(id, contractData);
        
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
        
        return updatedContract;
      } catch (error: any) {
        this.error = error.message || 'Error updating contract';
        throw error;
      }
    },

    async deleteContract(id: number) {
      try {
        await contractService.deleteContract(id);
        this.contracts = this.contracts.filter(c => c.id !== id);
        this.filteredContracts = this.filteredContracts.filter(c => c.id !== id);
      } catch (error: any) {
        this.error = error.message || 'Error deleting contract';
        throw error;
      }
    },

    async getContractStats(): Promise<ContractStats> {
      try {
        this.loading = true;
        // Usamos los datos del store para calcular estadísticas
        // En el futuro podríamos obtener estas estadísticas directamente desde el backend
        return {
          active: this.activeContracts.length,
          expiringSoon: this.expiringContracts.length,
          expired: this.contracts.filter(c => c.status === 'expired').length
        };
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch contract statistics';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});