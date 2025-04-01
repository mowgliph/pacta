// Re-exportaciones de la característica de contratos
export { ContractsListPage } from './pages/ContractsListPage';

// Exportación del servicio de contratos
export {
  ContractsService,
  type Contract,
  type ContractSearchParams,
  type ContractsResponse,
  type CreateContractData,
  type Attachment,
  type Supplement
} from './services/contracts-service';

// Esta estructura permite importar los componentes directamente desde la feature
// Ejemplo: import { ContractsListPage, ContractsService } from '@/features/contracts';
