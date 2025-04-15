import { Contract, ContractFilters } from '@/renderer/types/contracts';
import { electronAPI } from '@/renderer/api/electronAPI';

class ContractService {
  async getAllContracts(filters?: ContractFilters) {
    try {
      return await electronAPI.contracts.getAll(filters);
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      throw error;
    }
  }

  async getContractDetails(id: string) {
    try {
      return await electronAPI.contracts.getById(id);
    } catch (error) {
      console.error('Error al obtener detalles del contrato:', error);
      throw error;
    }
  }

  async createContract(contractData: Partial<Contract>) {
    try {
      if (contractData.documentFile) {
        const fileUrl = await electronAPI.contracts.uploadDocument({
          filePath: contractData.documentFile.path,
          contractId: contractData.id as string
        });
        contractData.documentUrl = fileUrl;
      }
      
      return await electronAPI.contracts.create(contractData);
    } catch (error) {
      console.error('Error al crear el contrato:', error);
      throw error;
    }
  }

  async updateContract(id: string, contractData: Partial<Contract>) {
    try {
      if (contractData.documentFile) {
        const fileUrl = await electronAPI.contracts.uploadDocument({
          filePath: contractData.documentFile.path,
          contractId: id
        });
        contractData.documentUrl = fileUrl;
      }

      return await electronAPI.contracts.update(id, contractData);
    } catch (error) {
      console.error('Error al actualizar el contrato:', error);
      throw error;
    }
  }

  async deleteContract(id: string) {
    try {
      return await electronAPI.contracts.delete(id);
    } catch (error) {
      console.error('Error al eliminar el contrato:', error);
      throw error;
    }
  }
}

const contractService = new ContractService();
export default contractService;