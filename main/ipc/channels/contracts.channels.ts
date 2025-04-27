/**
 * Canales IPC relacionados con contratos
 */
import { 
  ContractsListResponse,
  CreateContractRequest,
  UpdateContractRequest
} from '../../shared/types';

/**
 * Enumera los canales IPC para contratos
 */
export enum ContractsChannels {
  GET_ALL = "contracts:getAll",
  GET_BY_ID = "contracts:getById",
  CREATE = "contracts:create",
  UPDATE = "contracts:update",
  DELETE = "contracts:delete",
  ASSIGN_USERS = "contracts:assignUsers",
  UPDATE_ACCESS = "contracts:updateAccess",
}

/**
 * Interfaz para solicitudes relacionadas con contratos
 */
export interface ContractsRequests {
  [ContractsChannels.GET_ALL]: {
    request: { filters?: any };
    response: ContractsListResponse;
  };
  [ContractsChannels.GET_BY_ID]: {
    request: { id: string };
    response: { contract: any };
  };
  [ContractsChannels.CREATE]: {
    request: CreateContractRequest;
    response: { success: boolean; contract: any; message?: string };
  };
  [ContractsChannels.UPDATE]: {
    request: UpdateContractRequest;
    response: { success: boolean; contract: any; message?: string };
  };
  [ContractsChannels.DELETE]: {
    request: { id: string };
    response: { success: boolean; message?: string };
  };
  [ContractsChannels.ASSIGN_USERS]: {
    request: { id: string; userIds: string[] };
    response: { success: boolean; message?: string };
  };
  [ContractsChannels.UPDATE_ACCESS]: {
    request: { id: string; isRestricted: boolean };
    response: { success: boolean; message?: string };
  };
} 