import { StateCreator } from 'zustand'
import { 
  ContractsService, 
  Contract, 
  ContractSearchParams,
  CreateContractData
} from '@/features/contracts'
import { ApiError } from '@/lib/api'
import { ContractStatus } from '@/types/enums'

export interface FiltrosContrato {
  estado?: 'active' | 'pending' | 'expired' | 'cancelled'; // Usar los mismos valores que acepta la API
  busqueda?: string;
  fechaInicio?: string;
  fechaFin?: string;
  empresaId?: string;
  departamentoId?: string;
  etiquetas?: string[];
  pagina?: number;
  limite?: number;
  ordenarPor?: string;
  direccionOrden?: 'asc' | 'desc';
}

export interface SliceContratos {
  contratos: Contract[];
  contratoSeleccionado: Contract | null;
  filtros: FiltrosContrato;
  cargando: boolean;
  error: string | null;
  obtenerContratos: () => Promise<void>;
  obtenerContrato: (id: string) => Promise<void>;
  crearContrato: (contrato: Partial<CreateContractData>) => Promise<void>;
  actualizarContrato: (id: string, datos: Partial<CreateContractData>) => Promise<void>;
  eliminarContrato: (id: string) => Promise<void>;
  setFiltros: (filtros: Partial<FiltrosContrato>) => void;
  resetFiltros: () => void;
  getContratosFiltrados: () => Contract[];
}

// Mapear filtros de la interfaz de usuario a parámetros de búsqueda de la API
const mapFiltrosToParams = (filtros: FiltrosContrato): ContractSearchParams => {
  return {
    status: filtros.estado,
    search: filtros.busqueda,
    startDate: filtros.fechaInicio,
    endDate: filtros.fechaFin,
    companyId: filtros.empresaId,
    page: filtros.pagina,
    limit: filtros.limite,
    sortBy: filtros.ordenarPor,
    sortOrder: filtros.direccionOrden,
  };
};

export const crearSliceContratos: StateCreator<SliceContratos> = (set, get) => ({
  contratos: [],
  contratoSeleccionado: null,
  cargando: false,
  error: null,
  filtros: {},

  obtenerContratos: async () => {
    set({ cargando: true, error: null });
    try {
      // Usar el nuevo ContractsService con los filtros mapeados
      const params = mapFiltrosToParams(get().filtros);
      const response = await ContractsService.getContracts(params);
      
      set({ 
        contratos: response.data, 
        cargando: false 
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        error: apiError.message || 'Error al obtener contratos',
        cargando: false 
      });
    }
  },

  obtenerContrato: async (id) => {
    set({ cargando: true, error: null });
    try {
      // Usar el nuevo ContractsService para obtener un contrato específico
      const contrato = await ContractsService.getContract(id);
      
      set({ 
        contratoSeleccionado: contrato,
        cargando: false 
      });
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        error: apiError.message || 'Error al obtener contrato',
        cargando: false 
      });
    }
  },

  crearContrato: async (contrato) => {
    set({ cargando: true, error: null });
    try {
      // Usar el nuevo ContractsService para crear un contrato
      const nuevoContrato = await ContractsService.createContract(contrato as CreateContractData);
      
      set((state) => ({ 
        contratos: [...state.contratos, nuevoContrato],
        cargando: false 
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        error: apiError.message || 'Error al crear contrato',
        cargando: false 
      });
    }
  },

  actualizarContrato: async (id, datos) => {
    set({ cargando: true, error: null });
    try {
      // Usar el nuevo ContractsService para actualizar un contrato
      const contratoActualizado = await ContractsService.updateContract(id, datos);
      
      set((state) => ({
        contratos: state.contratos.map(c => c.id === id ? contratoActualizado : c),
        contratoSeleccionado: contratoActualizado,
        cargando: false
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        error: apiError.message || 'Error al actualizar contrato',
        cargando: false 
      });
    }
  },

  eliminarContrato: async (id) => {
    set({ cargando: true, error: null });
    try {
      // Usar el nuevo ContractsService para eliminar un contrato
      await ContractsService.deleteContract(id);
      
      set((state) => ({
        contratos: state.contratos.filter(c => c.id !== id),
        cargando: false
      }));
    } catch (error) {
      const apiError = error as ApiError;
      set({ 
        error: apiError.message || 'Error al eliminar contrato',
        cargando: false 
      });
    }
  },

  setFiltros: (filtros) => {
    set((state) => ({
      filtros: { ...state.filtros, ...filtros }
    }));
  },

  resetFiltros: () => {
    set({ filtros: {} });
  },

  getContratosFiltrados: () => {
    const { contratos, filtros } = get();
    
    if (Object.keys(filtros).length === 0) {
      return contratos;
    }
    
    return contratos.filter(contrato => {
      if (filtros.estado && contrato.status !== filtros.estado) return false;
      
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const nombre = contrato.name.toLowerCase();
        const descripcion = contrato.description?.toLowerCase() || '';
        
        if (!nombre.includes(busqueda) && !descripcion.includes(busqueda)) {
          return false;
        }
      }
      
      if (filtros.fechaInicio && new Date(contrato.startDate) < new Date(filtros.fechaInicio)) return false;
      if (filtros.fechaFin && new Date(contrato.endDate) > new Date(filtros.fechaFin)) return false;
      if (filtros.empresaId && contrato.companyId !== filtros.empresaId) return false;
      
      return true;
    });
  }
});