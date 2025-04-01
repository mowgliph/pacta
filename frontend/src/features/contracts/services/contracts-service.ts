import { api } from '@/lib/api';

// Tipo para contratos
export type Contract = {
  id: string;
  name: string;
  description?: string;
  contractNumber: string;  // Número único de contrato
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
  type: 'client' | 'provider';  // Tipo de contrato: cliente o proveedor
  authorizedBy?: string;  // Persona que autoriza
  signatures?: string[];  // Firmas del contrato
  additionalInfo?: Record<string, any>;  // Información adicional flexible
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
  contractId: string;
  documentUrl?: string;
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
  type?: 'client' | 'provider';  // Filtro por tipo de contrato
  contractNumber?: string;  // Búsqueda por número de contrato
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
  contractNumber: string;
  companyId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  value: number;
  currency: string;
  tags?: string[];
  type: 'client' | 'provider';
  authorizedBy?: string;
  signatures?: string[];
  additionalInfo?: Record<string, any>;
}

// Datos para crear un suplemento
export type CreateSupplementData = {
  name: string;
  description?: string;
  effectiveDate: string;
  contractId: string;
  documentFile?: File;
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
   * Busca un contrato por número
   */
  findContractByNumber: (contractNumber: string) =>
    api.get<Contract[]>(`/contracts/search`, { params: { contractNumber } }),
  
  /**
   * Crea un nuevo contrato
   */
  createContract: (data: CreateContractData, documentFile?: File) => {
    const formData = new FormData();
    
    // Añadir los datos del contrato como JSON
    formData.append('data', JSON.stringify(data));
    
    // Añadir el archivo si existe
    if (documentFile) {
      formData.append('document', documentFile);
    }
    
    return api.post<Contract>('/contracts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  /**
   * Actualiza un contrato existente
   */
  updateContract: (id: string, data: Partial<CreateContractData>, documentFile?: File) => {
    if (documentFile) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      formData.append('document', documentFile);
      
      return api.put<Contract>(`/contracts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.put<Contract>(`/contracts/${id}`, data);
    }
  },
  
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
  createSupplement: (contractId: string, data: CreateSupplementData) => {
    const formData = new FormData();
    
    // Añadir los datos del suplemento como JSON
    formData.append('data', JSON.stringify(data));
    
    // Añadir el archivo si existe
    if (data.documentFile) {
      formData.append('document', data.documentFile);
    }
    
    return api.post<Supplement>(`/contracts/${contractId}/supplements`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Obtiene un suplemento por su ID
   */
  getSupplement: (contractId: string, supplementId: string) => 
    api.get<Supplement>(`/contracts/${contractId}/supplements/${supplementId}`),

  /**
   * Actualiza un suplemento existente
   */
  updateSupplement: (contractId: string, supplementId: string, data: Partial<CreateSupplementData>) => {
    if (data.documentFile) {
      const formData = new FormData();
      const { documentFile, ...restData } = data;
      formData.append('data', JSON.stringify(restData));
      formData.append('document', documentFile);
      
      return api.put<Supplement>(`/contracts/${contractId}/supplements/${supplementId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.put<Supplement>(`/contracts/${contractId}/supplements/${supplementId}`, data);
    }
  },

  /**
   * Elimina un suplemento
   */
  deleteSupplement: (contractId: string, supplementId: string) => 
    api.delete(`/contracts/${contractId}/supplements/${supplementId}`),

  /**
   * Búsqueda avanzada de contratos
   */
  advancedSearch: (params: ContractSearchParams) =>
    api.get<ContractsResponse>('/contracts/advanced-search', { params }),
}; 