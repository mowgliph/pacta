import { defineStore } from 'pinia';
import axios from 'axios';

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
        const response = await axios.get('/api/contracts');
        this.contracts = response.data;
      } catch (error) {
        this.error = 'Error fetching contracts';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createContract(contractData: Partial<Contract>) {
      try {
        const response = await axios.post('/api/contracts', contractData);
        this.contracts.push(response.data);
        return response.data;
      } catch (error) {
        this.error = 'Error creating contract';
        throw error;
      }
    },

    async updateContract(id: number, contractData: Partial<Contract>) {
      try {
        const response = await axios.put(`/api/contracts/${id}`, contractData);
        const index = this.contracts.findIndex(c => c.id === id);
        if (index !== -1) {
          this.contracts[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = 'Error updating contract';
        throw error;
      }
    },

    async deleteContract(id: number) {
      try {
        await axios.delete(`/api/contracts/${id}`);
        this.contracts = this.contracts.filter(c => c.id !== id);
      } catch (error) {
        this.error = 'Error deleting contract';
        throw error;
      }
    },

    async getContractStats(): Promise<ContractStats> {
      try {
        this.loading = true;
        // TODO: Replace with actual API call
        // Temporary mock data
        return {
          active: 15,
          expiringSoon: 3,
          expired: 2
        };
      } catch (error) {
        this.error = 'Failed to fetch contract statistics';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});