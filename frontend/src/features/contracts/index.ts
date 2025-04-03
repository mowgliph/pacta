// Exportar páginas 
export { default as ContractCreatePage } from './pages/ContractCreatePage';
export { default as ContractDetailsPage } from './pages/ContractDetailsPage';
export { default as ContractEditPage } from './pages/ContractEditPage';
export { default as ContractsListPage } from './pages/ContractsListPage';
export { default as SupplementCreatePage } from './pages/SupplementCreatePage';
export { default as SupplementDetailsPage } from './pages/SupplementDetailsPage';
export { default as SupplementEditPage } from './pages/SupplementEditPage';
export { default as SupplementListPage } from './pages/SupplementListPage';

// Exportar hooks
export { 
  useContract, 
  useSearchContracts, 
  useContractAttachments, 
  useContractSupplements, 
  useSupplement,
  useCreateContract,
  useUpdateContract,
  useDeleteContract
} from './hooks/useContracts';

// Exportar servicios
export { ContractService } from './services/contracts-service';

// Exportar tipos
export type { 
  Contract, 
  ContractSearchParams, 
  Supplement,
  ContractAttachment,
  CreateContractData
} from './services/contracts-service';

// Re-exportar enums de los tipos centrales de la aplicación
export { ContractStatus, ContractType } from '@/types/enums';

// Exportar componentes
export { ContractsLayout } from './layouts/ContractsLayout';

// Esta estructura permite importar los componentes directamente desde la feature
// Ejemplo: import { ContractsListPage, ContractsService } from '@/features/contracts';
