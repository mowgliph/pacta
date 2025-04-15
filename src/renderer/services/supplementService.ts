import { electronAPI } from '../api/electronAPI';
import type { Supplement } from '../types/contracts';

class SupplementService {
  async addSupplement(contractId: string, supplementData: Partial<Supplement>) {
    try {
      if (supplementData.documentFile) {
        const fileUrl = await electronAPI.supplements.uploadDocument({
          filePath: supplementData.documentFile.path,
          supplementId: 'new'
        });
        supplementData.fileUrl = fileUrl;
      }
      return await electronAPI.supplements.add(contractId, supplementData);
    } catch (error) {
      console.error('Error al agregar suplemento:', error);
      throw error;
    }
  }

  async updateSupplement(
    contractId: string,
    supplementId: string,
    supplementData: Partial<Supplement>
  ) {
    try {
      if (supplementData.documentFile) {
        const fileUrl = await electronAPI.supplements.uploadDocument({
          filePath: supplementData.documentFile.path,
          supplementId
        });
        supplementData.fileUrl = fileUrl;
      }
      return await electronAPI.supplements.update(contractId, supplementId, supplementData);
    } catch (error) {
      console.error('Error al actualizar suplemento:', error);
      throw error;
    }
  }

  editSupplement(
    contractId: string, 
    supplementId: string, 
    supplementData: Partial<Supplement>
  ) {
    return this.updateSupplement(contractId, supplementId, supplementData);
  }

  async getSupplementDetails(contractId: string, supplementId: string) {
    try {
      return await electronAPI.supplements.getDetails(contractId, supplementId);
    } catch (error) {
      console.error('Error al obtener detalles del suplemento:', error);
      throw error;
    }
  }

  async deleteSupplement(contractId: string, supplementId: string) {
    try {
      return await electronAPI.supplements.delete(contractId, supplementId);
    } catch (error) {
      console.error('Error al eliminar suplemento:', error);
      throw error;
    }
  }
}

const supplementService = new SupplementService();
export default supplementService;