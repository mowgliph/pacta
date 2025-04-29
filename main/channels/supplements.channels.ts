/**
 * Canales IPC relacionados con suplementos de contratos
 */
import { 
  ApproveSupplementRequest,
  CreateSupplementRequest,
  UpdateSupplementRequest
} from '../../shared/types';

/**
 * Enumera los canales IPC para suplementos
 */
export enum SupplementsChannels {
  GET_ALL = "supplements:getAll",
  GET_BY_ID = "supplements:getById",
  CREATE = "supplements:create",
  UPDATE = "supplements:update",
  DELETE = "supplements:delete",
  APPROVE = "supplements:approve",
}

/**
 * Interfaz para solicitudes relacionadas con suplementos
 */
export interface SupplementsRequests {
  [SupplementsChannels.GET_ALL]: {
    request: { contractId: string };
    response: { supplements: any[]; total: number };
  };
  [SupplementsChannels.GET_BY_ID]: {
    request: { id: string };
    response: { supplement: any };
  };
  [SupplementsChannels.CREATE]: {
    request: CreateSupplementRequest;
    response: { success: boolean; supplement: any; message?: string };
  };
  [SupplementsChannels.UPDATE]: {
    request: UpdateSupplementRequest;
    response: { success: boolean; supplement: any; message?: string };
  };
  [SupplementsChannels.DELETE]: {
    request: { id: string };
    response: { success: boolean; message?: string };
  };
  [SupplementsChannels.APPROVE]: {
    request: ApproveSupplementRequest;
    response: { success: boolean; message?: string };
  };
} 