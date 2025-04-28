import { create } from "zustand";

/**
 * Tipo para representar un contrato
 */
export interface Contract {
  id: string;
  number: string;
  company: string;
  type: "Cliente" | "Proveedor";
  startDate: string;
  endDate: string;
  amount: number;
  description: string;
  status: "Vigente" | "Próximo a Vencer" | "Vencido" | "Archivado";
  createdAt: string;
  updatedAt: string;
  documentUrl?: string;
  supplements?: ContractSupplement[];
}

/**
 * Tipo para representar un suplemento de contrato
 */
export interface ContractSupplement {
  id: string;
  contractId: string;
  modifiedField: "description" | "endDate" | "amount" | "type";
  previousValue: string;
  newValue: string;
  date: string;
  description: string;
  documentUrl?: string;
  createdAt: string;
}

/**
 * Filtros para contratos
 */
export interface ContractFilters {
  type?: "Cliente" | "Proveedor" | "Todos";
  status?: "Vigente" | "Próximo a Vencer" | "Vencido" | "Archivado" | "Todos";
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Estado para el store de contratos
 */
interface ContractState {
  // Lista de contratos
  contracts: Contract[];
  
  // Contratos filtrados según criterios actuales
  filteredContracts: Contract[];
  
  // Contrato seleccionado actualmente
  selectedContract: Contract | null;
  
  // Filtros aplicados actualmente
  filters: ContractFilters;
  
  // Paginación
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  
  // Estado de carga
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  setFilters: (filters: Partial<ContractFilters>) => void;
  setPagination: (page: number, pageSize?: number) => void;
  fetchContracts: () => Promise<void>;
  fetchContractById: (id: string) => Promise<void>;
  createContract: (contract: Omit<Contract, "id" | "status" | "createdAt" | "updatedAt">) => Promise<string>;
  createSupplement: (supplement: Omit<ContractSupplement, "id" | "createdAt">) => Promise<void>;
  archiveContract: (id: string) => Promise<void>;
  resetState: () => void;
}

/**
 * Store de contratos
 * Gestiona el estado y operaciones relacionadas con contratos
 */
export const useContractStore = create<ContractState>()((set, get) => ({
  contracts: [],
  filteredContracts: [],
  selectedContract: null,
  filters: {
    type: "Todos",
    status: "Todos",
    search: "",
  },
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  
  // Establecer filtros de búsqueda
  setFilters: (filters) => {
    set((state) => {
      const newFilters = { ...state.filters, ...filters };
      
      // Aplicar filtros a la lista de contratos
      let filtered = [...state.contracts];
      
      // Filtro por tipo
      if (newFilters.type && newFilters.type !== "Todos") {
        filtered = filtered.filter(c => c.type === newFilters.type);
      }
      
      // Filtro por estado
      if (newFilters.status && newFilters.status !== "Todos") {
        filtered = filtered.filter(c => c.status === newFilters.status);
      }
      
      // Filtro por búsqueda (en número, empresa o descripción)
      if (newFilters.search && newFilters.search.trim() !== "") {
        const searchTerm = newFilters.search.toLowerCase().trim();
        filtered = filtered.filter(c => 
          c.number.toLowerCase().includes(searchTerm) ||
          c.company.toLowerCase().includes(searchTerm) ||
          c.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Filtro por rango de fechas
      if (newFilters.dateRange) {
        const { start, end } = newFilters.dateRange;
        if (start && end) {
          filtered = filtered.filter(c => {
            const contractDate = new Date(c.endDate);
            return contractDate >= new Date(start) && contractDate <= new Date(end);
          });
        }
      }
      
      // Actualizar paginación
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / state.pagination.pageSize);
      
      return {
        filters: newFilters,
        filteredContracts: filtered,
        pagination: {
          ...state.pagination,
          page: 1, // Volver a la primera página al cambiar filtros
          totalItems,
          totalPages
        }
      };
    });
  },
  
  // Establecer paginación
  setPagination: (page, pageSize) => {
    set((state) => {
      const newPageSize = pageSize || state.pagination.pageSize;
      const totalPages = Math.ceil(state.filteredContracts.length / newPageSize);
      
      return {
        pagination: {
          page: page > totalPages ? totalPages : page,
          pageSize: newPageSize,
          totalItems: state.filteredContracts.length,
          totalPages
        }
      };
    });
  },
  
  // Cargar contratos desde la API
  fetchContracts: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await window.Electron.ipcRenderer.invoke("contracts:getAll");
      
      if (response && Array.isArray(response.contracts)) {
        // Procesar los contratos recibidos
        const contracts = response.contracts.map((c: any) => ({
          id: c.id,
          number: c.number,
          company: c.company,
          type: c.type,
          startDate: c.startDate,
          endDate: c.endDate,
          amount: c.amount,
          description: c.description,
          status: c.status,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          documentUrl: c.documentUrl,
          supplements: c.supplements || []
        }));
        
        set({ 
          contracts,
          isLoading: false
        });
        
        // Aplicar filtros actuales a los nuevos contratos
        get().setFilters({});
      }
    } catch (error: any) {
      console.error("Error al cargar contratos:", error);
      set({ 
        error: error.message || "Error al cargar contratos",
        isLoading: false 
      });
    }
  },
  
  // Cargar un contrato específico por ID
  fetchContractById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await window.Electron.ipcRenderer.invoke("contracts:getById", { id });
      
      if (response && response.contract) {
        set({ 
          selectedContract: {
            id: response.contract.id,
            number: response.contract.number,
            company: response.contract.company,
            type: response.contract.type,
            startDate: response.contract.startDate,
            endDate: response.contract.endDate,
            amount: response.contract.amount,
            description: response.contract.description,
            status: response.contract.status,
            createdAt: response.contract.createdAt,
            updatedAt: response.contract.updatedAt,
            documentUrl: response.contract.documentUrl,
            supplements: response.contract.supplements || []
          },
          isLoading: false
        });
      }
    } catch (error: any) {
      console.error("Error al cargar contrato:", error);
      set({ 
        error: error.message || "Error al cargar contrato",
        isLoading: false 
      });
    }
  },
  
  // Crear un nuevo contrato
  createContract: async (contractData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await window.Electron.ipcRenderer.invoke("contracts:create", contractData);
      
      if (response && response.success && response.contractId) {
        // Recargar la lista de contratos después de crear uno
        await get().fetchContracts();
        
        set({ isLoading: false });
        return response.contractId;
      }
      
      throw new Error(response.error || "Error al crear contrato");
    } catch (error: any) {
      console.error("Error al crear contrato:", error);
      set({ 
        error: error.message || "Error al crear contrato",
        isLoading: false 
      });
      return "";
    }
  },
  
  // Crear un nuevo suplemento para un contrato
  createSupplement: async (supplementData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await window.Electron.ipcRenderer.invoke("contracts:supplements:create", supplementData);
      
      if (response && response.success) {
        // Si tenemos un contrato seleccionado y el suplemento es para ese contrato,
        // actualizamos también el contrato seleccionado
        if (get().selectedContract && get().selectedContract.id === supplementData.contractId) {
          await get().fetchContractById(supplementData.contractId);
        }
        
        // Recargar la lista de contratos para reflejar los cambios
        await get().fetchContracts();
        
        set({ isLoading: false });
      } else {
        throw new Error(response.error || "Error al crear suplemento");
      }
    } catch (error: any) {
      console.error("Error al crear suplemento:", error);
      set({ 
        error: error.message || "Error al crear suplemento",
        isLoading: false 
      });
    }
  },
  
  // Archivar un contrato
  archiveContract: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await window.Electron.ipcRenderer.invoke("contracts:archive", { id });
      
      if (response && response.success) {
        // Si era el contrato seleccionado, lo actualizamos
        if (get().selectedContract && get().selectedContract.id === id) {
          set(state => ({
            selectedContract: state.selectedContract ? {
              ...state.selectedContract,
              status: "Archivado"
            } : null
          }));
        }
        
        // Actualizar el estado en la lista de contratos
        set(state => ({
          contracts: state.contracts.map(c => 
            c.id === id ? { ...c, status: "Archivado" } : c
          ),
          isLoading: false
        }));
        
        // Reaplicar filtros para actualizar la lista filtrada
        get().setFilters({});
      } else {
        throw new Error(response.error || "Error al archivar contrato");
      }
    } catch (error: any) {
      console.error("Error al archivar contrato:", error);
      set({ 
        error: error.message || "Error al archivar contrato",
        isLoading: false 
      });
    }
  },
  
  // Resetear el estado del store
  resetState: () => {
    set({
      contracts: [],
      filteredContracts: [],
      selectedContract: null,
      filters: {
        type: "Todos",
        status: "Todos",
        search: "",
      },
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      },
      isLoading: false,
      error: null,
    });
  }
}));

// Selectores para acceder a partes específicas del estado
export const selectContractById = (id: string) => (state: ContractState) => 
  state.contracts.find(c => c.id === id) || null;

export const selectPaginatedContracts = (state: ContractState) => {
  const { page, pageSize } = state.pagination;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return state.filteredContracts.slice(startIndex, endIndex);
};

export const selectContractsByStatus = (status: Contract['status']) => (state: ContractState) =>
  state.contracts.filter(c => c.status === status);

export const selectContractsByType = (type: Contract['type']) => (state: ContractState) =>
  state.contracts.filter(c => c.type === type);

export const selectUpcomingExpirations = (daysThreshold: number = 30) => (state: ContractState) => {
  const today = new Date();
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + daysThreshold);
  
  return state.contracts
    .filter(c => {
      const endDate = new Date(c.endDate);
      return c.status === "Vigente" && endDate > today && endDate <= thresholdDate;
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
}; 