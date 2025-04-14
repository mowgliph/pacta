import { Contract, ContractFilters } from '../types/contracts';

export interface IElectronAPI {
  invoke<T = any>(channel: string, ...args: any[]): Promise<T>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

export class ElectronAPI {
  private static instance: ElectronAPI;
  
  private constructor() {}

  static getInstance(): ElectronAPI {
    if (!ElectronAPI.instance) {
      ElectronAPI.instance = new ElectronAPI();
    }
    return ElectronAPI.instance;
  }

  async invoke<T>(channel: string, ...args: any[]): Promise<T> {
    return window.electronAPI.invoke(channel, ...args);
  }

  // Métodos específicos para contratos
  async getContracts(filters?: ContractFilters): Promise<Contract[]> {
    return this.invoke('contracts:getAll', filters);
  }

  async getContractDetails(id: string): Promise<Contract> {
    return this.invoke('contracts:getDetails', id);
  }

  async createContract(data: Partial<Contract>): Promise<Contract> {
    return this.invoke('contracts:create', data);
  }

  async updateContract(id: string, data: Partial<Contract>): Promise<Contract> {
    return this.invoke('contracts:update', { contractId: id, data });
  }

  async deleteContract(id: string): Promise<boolean> {
    return this.invoke('contracts:delete', id);
  }

  async uploadDocument(file: File): Promise<string> {
    return this.invoke('contracts:uploadDocument', {
      filePath: file.path,
      fileName: file.name
    });
  }

  async addSupplement(contractId: string, data: any): Promise<any> {
    return this.invoke('contracts:addSupplement', {
      contractId,
      ...data
    });
  }

  async editSupplement(contractId: string, supplementId: string, data: any): Promise<any> {
    return this.invoke('contracts:editSupplement', {
      contractId,
      supplementId,
      ...data
    });
  }
}

// Exportar una instancia única
export const electronAPI = ElectronAPI.getInstance();