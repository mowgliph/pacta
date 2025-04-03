import { api } from '@/lib/api';

// Enums
export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  RENEWAL = 'RENEWAL'
}

export enum ContractType {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  EMPLOYEE = 'EMPLOYEE',
  OTHER = 'OTHER'
}

// Tipo para contrato
export type Contract = {
  id: string;
  numero: string;
  fechaInicio: string;
  objeto: string;
  tipo: string;
  denominador: string;
  vigencia: number;
  fechaFin?: string;
  estado: ContractStatus;
  title: string;
  description?: string;
  fileUrl?: string;
  fileSize?: number;
  fileMimeType?: string;
  amount?: number;
  currency?: string;
  notes?: string;
  hasSupplements: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  lastModifiedBy?: string;
  authorId: string;
  companyId: string;
  departmentId?: string;
  company?: Company;
};

// Tipo para empresa
export type Company = {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo?: string;
  industry?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

// Tipo para adjuntos
export type ContractAttachment = {
  id: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  contractId: string;
  createdAt: string;
  updatedAt: string;
};

// Tipo para suplementos
export type Supplement = {
  id: string;
  name: string;
  description?: string;
  effectiveDate: string;
  contractId: string;
  documentUrl?: string;
  validity?: string;
  newAgreements?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// Parámetros para la búsqueda de contratos
export type ContractSearchParams = {
  page: number;
  limit: number;
  status?: ContractStatus;
  companyId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  type?: ContractType;
  contractNumber?: string;
  tags?: string[];
  clientSector?: string;
  providerCategory?: string;
};

// Respuesta paginada
export type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type SearchResponse<T> = {
  data: T[];
  pagination: Pagination;
};

// Datos para crear un contrato
export type CreateContractData = {
  name: string;
  description?: string;
  contractNumber: string;
  companyId: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  type: ContractType;
  amount: number;
  currency: string;
  tags?: string[];
  authorizedBy?: string;
  signatures?: string[];
  additionalInfo?: Record<string, any>;
  attachments?: FormData;
};

// Datos para crear un suplemento
export type CreateSupplementData = {
  name: string;
  description?: string;
  effectiveDate: string;
  contractId: string;
  documentFile?: File;
};

/**
 * Servicio para interactuar con la API de contratos
 */
export const ContractService = {
  // Búsqueda de contratos con filtros
  searchContracts: async (searchTerm: string, params: Partial<ContractSearchParams>): Promise<SearchResponse<Contract>> => {
    // Asegurarnos de que los parámetros son compatibles con la API
    const apiParams: Record<string, any> = {
      ...params,
      search: searchTerm || params.search,
      page: params.page || 1,
      limit: params.limit || 10
    };
    
    // Añadir el filtro de tipo si está presente
    if (params.type) {
      apiParams.type = params.type;
    }
    
    // Realizar la solicitud a la API
    const response = await api.get<SearchResponse<Contract>>('/contracts', {
      params: apiParams
    });
    
    return response;
  },
  
  // Obtener todos los contratos por tipo
  getContractsByType: async (type: ContractType): Promise<Contract[]> => {
    return await api.get<Contract[]>('/contracts', {
      params: { type, limit: 100 }
    });
  },
  
  // Obtener estadísticas de contratos por tipo
  getContractStatsByType: async (): Promise<{ client: number; provider: number; other: number }> => {
    return await api.get<{ client: number; provider: number; other: number }>('/contracts/stats/by-type');
  },
  
  // Obtener un contrato por ID
  getContract: async (id: string): Promise<Contract> => {
    return await api.get<Contract>(`/contracts/${id}`);
  },
  
  // Crear un nuevo contrato
  createContract: async (data: CreateContractData): Promise<Contract> => {
    return await api.post<Contract, CreateContractData>('/contracts', data);
  },
  
  // Actualizar un contrato existente
  updateContract: async (id: string, data: CreateContractData): Promise<Contract> => {
    return await api.put<Contract, CreateContractData>(`/contracts/${id}`, data);
  },
  
  // Eliminar un contrato
  deleteContract: async (id: string): Promise<void> => {
    await api.delete<void>(`/contracts/${id}`);
  },
  
  // Cambiar el estado de un contrato
  changeContractStatus: async (id: string, status: ContractStatus): Promise<Contract> => {
    return await api.patch<Contract, { status: ContractStatus }>(`/contracts/${id}/status`, { status });
  },
  
  // Obtener los adjuntos de un contrato
  getContractAttachments: async (contractId: string): Promise<ContractAttachment[]> => {
    return await api.get<ContractAttachment[]>(`/contracts/${contractId}/attachments`);
  },
  
  // Añadir un adjunto a un contrato
  addContractAttachment: async (contractId: string, formData: FormData): Promise<ContractAttachment> => {
    return await api.post<ContractAttachment, FormData>(`/contracts/${contractId}/attachments`, formData);
  },
  
  // Eliminar un adjunto de un contrato
  deleteContractAttachment: async (attachmentId: string): Promise<void> => {
    await api.delete<void>(`/attachments/${attachmentId}`);
  },
  
  // Descargar el documento de un contrato
  downloadContractDocument: async (contractId: string): Promise<void> => {
    // Obtener la URL base de la API desde variables de entorno
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Abrir la URL en una nueva pestaña
    window.open(`${baseUrl}/contracts/${contractId}/download`, '_blank');
  },
  
  // Obtener los suplementos de un contrato
  getContractSupplements: async (contractId: string): Promise<Supplement[]> => {
    return await api.get<Supplement[]>(`/contracts/${contractId}/supplements`);
  },
  
  // Obtener un suplemento por ID
  getSupplement: async (id: string): Promise<Supplement> => {
    return await api.get<Supplement>(`/supplements/${id}`);
  },
  
  // Descargar el documento de un suplemento
  downloadSupplementDocument: async (supplementId: string): Promise<void> => {
    // Obtener la URL base de la API desde variables de entorno
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    // Abrir la URL en una nueva pestaña
    window.open(`${baseUrl}/supplements/${supplementId}/download`, '_blank');
  },
  
  // Crear un nuevo suplemento
  createSupplement: async (contractId: string, formData: FormData): Promise<Supplement> => {
    return await api.post<Supplement, FormData>(`/contracts/${contractId}/supplements`, formData);
  },
  
  // Actualizar un suplemento existente
  updateSupplement: async (id: string, formData: FormData): Promise<Supplement> => {
    return await api.put<Supplement, FormData>(`/supplements/${id}`, formData);
  },
  
  // Eliminar un suplemento
  deleteSupplement: async (id: string): Promise<void> => {
    await api.delete<void>(`/supplements/${id}`);
  }
}; 