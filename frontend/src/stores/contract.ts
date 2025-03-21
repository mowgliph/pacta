import { defineStore } from 'pinia';
import { contractService } from '@/services/contract.service';

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
    async fetchContracts() {
      this.loading = true;
      this.error = null;
      try {
        this.contracts = await contractService.getContracts();
      } catch (error: any) {
        this.error = error.message || 'Error fetching contracts';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createContract(contractData: Partial<Contract>) {
      try {
        const newContract = await contractService.createContract(contractData);
        this.contracts.push(newContract);
        return newContract;
      } catch (error: any) {
        this.error = error.message || 'Error creating contract';
        throw error;
      }
    },

    async updateContract(id: number, contractData: Partial<Contract>) {
      try {
        const updatedContract = await contractService.updateContract(id, contractData);
        const index = this.contracts.findIndex(c => c.id === id);
        if (index !== -1) {
          this.contracts[index] = updatedContract;
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