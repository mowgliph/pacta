import { Contract, ContractFilters } from '@/renderer/types/contracts';
import { electronAPI } from '@/renderer/api/electronAPI';

class ContractService {
  async getAllContracts(filters?: ContractFilters) {
    try {
      return await electronAPI.getContracts(filters);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  async getContractDetails(id: string) {
    try {
      return await electronAPI.getContractDetails(id);
    } catch (error) {
      console.error('Error fetching contract details:', error);
      throw error;
    }
  }

  async createContract(contractData: Partial<Contract>) {
    try {
      if (contractData.documentFile) {
        const fileUrl = await electronAPI.uploadDocument(contractData.documentFile);
        contractData.documentUrl = fileUrl;
      }
      
      return await electronAPI.createContract(contractData);
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  async updateContract(id: string, contractData: Partial<Contract>) {
    try {
      if (contractData.documentFile) {
        const fileUrl = await electronAPI.uploadDocument(contractData.documentFile);
        contractData.documentUrl = fileUrl;
      }

      return await electronAPI.updateContract(id, contractData);
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  async deleteContract(id: string) {
    try {
      return await electronAPI.deleteContract(id);
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }
}

const contractService = new ContractService();
export default contractService;