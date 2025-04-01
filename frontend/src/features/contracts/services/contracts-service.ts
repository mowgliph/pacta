import { api } from '@/lib/api';

// Tipo para contratos
export type Contract = {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  companyName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  value: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
  supplements?: Supplement[];
  tags?: string[];
}

// Tipo para adjuntos
export type Attachment = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createdAt: string;
}

// Tipo para suplementos
export type Supplement = {
  id: string;
  name: string;
  description?: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

// Parámetros para la búsqueda de contratos
export type ContractSearchParams = {
  page?: number;
  limit?: number;
  status?: 'active' | 'pending' | 'expired' | 'cancelled';
  companyId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Respuesta paginada de contratos
export type ContractsResponse = {
  data: Contract[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Datos para crear un contrato
export type CreateContractData = {
  name: string;
  description?: string;
  companyId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  value: number;
  currency: string;
  tags?: string[];
}

/**
 * Servicio para gestionar contratos
 */
export const ContractsService = {
  /**
   * Obtiene todos los contratos con paginación y filtros
   */
  getContracts: (params: ContractSearchParams = {}) => 
    api.get<ContractsResponse>('/contracts', { params }),
  
  /**
   * Obtiene un contrato por su ID
   */
  getContract: (id: string) => 
    api.get<Contract>(`/contracts/${id}`),
  
  /**
   * Crea un nuevo contrato
   */
  createContract: (data: CreateContractData) => 
    api.post<Contract>('/contracts', data),
  
  /**
   * Actualiza un contrato existente
   */
  updateContract: (id: string, data: Partial<CreateContractData>) => 
    api.put<Contract>(`/contracts/${id}`, data),
  
  /**
   * Elimina un contrato
   */
  deleteContract: (id: string) => 
    api.delete(`/contracts/${id}`),
  
  /**
   * Obtiene los adjuntos de un contrato
   */
  getContractAttachments: (contractId: string) => 
    api.get<Attachment[]>(`/contracts/${contractId}/attachments`),
  
  /**
   * Sube un nuevo adjunto para un contrato
   */
  uploadAttachment: (contractId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<Attachment>(`/contracts/${contractId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  /**
   * Elimina un adjunto
   */
  deleteAttachment: (contractId: string, attachmentId: string) => 
    api.delete(`/contracts/${contractId}/attachments/${attachmentId}`),
    
  /**
   * Obtiene los suplementos de un contrato
   */
  getContractSupplements: (contractId: string) => 
    api.get<Supplement[]>(`/contracts/${contractId}/supplements`),
  
  /**
   * Crea un nuevo suplemento para un contrato
   */
  createSupplement: (contractId: string, data: Partial<Supplement>) => 
    api.post<Supplement>(`/contracts/${contractId}/supplements`, data),
}; 