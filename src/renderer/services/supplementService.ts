import { electronAPI } from '../api/electronAPI';
import type { Supplement } from '../types/contracts';

class SupplementService {
  async addSupplement(contractId: string, supplementData: Partial<Supplement>) {
    try {
      // Si hay un archivo adjunto, primero subirlo
      if (supplementData.documentFile) {
        const fileUrl = await electronAPI.invoke('files:upload', {
          file: supplementData.documentFile,
          contractId
        });
        supplementData.fileUrl = fileUrl;
      }

      return await electronAPI.invoke('contracts:addSupplement', {
        contractId,
        supplementData
      });
    } catch (error) {
      console.error('Error adding supplement:', error);
      throw error;
    }
  }

  async updateSupplement(
    contractId: string,
    supplementId: string,
    supplementData: Partial<Supplement>
  ) {
    try {
      // Si hay un nuevo archivo adjunto, subirlo
      if (supplementData.documentFile) {
        const fileUrl = await electronAPI.invoke('files:upload', {
          file: supplementData.documentFile,
          contractId
        });
        supplementData.fileUrl = fileUrl;
      }

      return await electronAPI.invoke('contracts:editSupplement', {
        contractId,
        supplementId,
        supplementData
      });
    } catch (error) {
      console.error('Error updating supplement:', error);
      throw error;
    }
  }

  async getSupplementDetails(contractId: string, supplementId: string) {
    try {
      return await electronAPI.invoke('contracts:getSupplementDetails', {
        contractId,
        supplementId
      });
    } catch (error) {
      console.error('Error fetching supplement details:', error);
      throw error;
    }
  }

  async deleteSupplement(contractId: string, supplementId: string) {
    try {
      return await electronAPI.invoke('contracts:deleteSupplement', {
        contractId,
        supplementId
      });
    } catch (error) {
      console.error('Error deleting supplement:', error);
      throw error;
    }
  }
}

export const supplementService = new SupplementService();