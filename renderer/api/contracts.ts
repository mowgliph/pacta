import { ApiResponse, PaginationResponse } from './common';

export interface Contract {
  id: string;
  // Agregar otros campos del contrato según sea necesario
}

export interface ContractCreateData {
  // Campos necesarios para crear un contrato
}

export interface ContractUpdateData {
  id: string;
  // Campos actualizables del contrato
}

export interface ContractsApi {
  list: (filters: any) => Promise<ApiResponse<PaginationResponse<Contract>>>;
  create: (data: ContractCreateData) => Promise<ApiResponse<Contract>>;
  update: (id: string, data: ContractUpdateData) => Promise<ApiResponse<Contract>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  export: (id: string) => Promise<ApiResponse<string>>;
  upload: (file: File) => Promise<ApiResponse<string>>;
  archive: (id: string) => Promise<ApiResponse<void>>;
  updateAccessControl: (id: string, data: any) => Promise<ApiResponse<void>>;
  assignUsers: (id: string, users: string[]) => Promise<ApiResponse<void>>;
  getById: (id: string) => Promise<ApiResponse<Contract>>;
}
