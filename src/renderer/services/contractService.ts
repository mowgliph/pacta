import { Contract, ContractFilters } from '@/renderer/types/contracts';
import { contractAPI } from '@/renderer/api/electronAPI';

class ContractService {
  async getAllContracts(filters?: ContractFilters) {
    try {
      return await contractAPI.getAll(filters);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  async getContractDetails(id: string) {
    try {
      return await contractAPI.getDetails(id);
    } catch (error) {
      console.error('Error fetching contract details:', error);
      throw error;
    }
  }

  async createContract(contractData: Partial<Contract>) {
    try {
      if (contractData.documentFile) {
        const fileUrl = await contractAPI.uploadDocument(contractData.documentFile);
        contractData.documentUrl = fileUrl;
      }
      
      return await contractAPI.create(contractData);
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  async updateContract(id: string, contractData: Partial<Contract>) {
    try {
      if (contractData.documentFile) {
        const fileUrl = await contractAPI.uploadDocument(contractData.documentFile);
        contractData.documentUrl = fileUrl;
      }

      return await contractAPI.update(id, contractData);
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  async deleteContract(id: string) {
    try {
      return await contractAPI.delete(id);
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();