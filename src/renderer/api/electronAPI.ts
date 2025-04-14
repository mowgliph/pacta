import { Contract, ContractFilters } from '../types/contracts';

export interface IElectronAPI {
  invoke<T = any>(channel: string, ...args: any[]): Promise<T>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

class ContractAPI {
  async getAll(filters?: ContractFilters): Promise<Contract[]> {
    return window.electronAPI.invoke('contracts:getAll', filters);
  }

  async getDetails(id: string): Promise<Contract> {
    return window.electronAPI.invoke('contracts:getDetails', id);
  }

  async create(data: Partial<Contract>): Promise<Contract> {
    return window.electronAPI.invoke('contracts:create', data);
  }

  async update(id: string, data: Partial<Contract>): Promise<Contract> {
    return window.electronAPI.invoke('contracts:update', { contractId: id, data });
  }

  async delete(id: string): Promise<boolean> {
    return window.electronAPI.invoke('contracts:delete', id);
  }

  async uploadDocument(file: File): Promise<string> {
    return window.electronAPI.invoke('contracts:uploadDocument', {
      filePath: file.path,
      fileName: file.name
    });
  }

  async addSupplement(contractId: string, data: any): Promise<any> {
    return window.electronAPI.invoke('contracts:addSupplement', {
      contractId,
      ...data
    });
  }

  async editSupplement(contractId: string, supplementId: string, data: any): Promise<any> {
    return window.electronAPI.invoke('contracts:editSupplement', {
      contractId,
      supplementId,
      ...data
    });
  }
}

export const contractAPI = new ContractAPI();