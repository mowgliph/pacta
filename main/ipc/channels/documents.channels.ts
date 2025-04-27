/**
 * Canales IPC relacionados con documentos
 */
import { 
  DocumentsListResponse,
  UpdateDocumentMetadataRequest
} from '../../shared/types';

/**
 * Enumera los canales IPC para documentos
 */
export enum DocumentsChannels {
  OPEN = "documents:open",
  SAVE = "documents:save",
  GET_ALL = "documents:getAll",
  GET_BY_ID = "documents:getById",
  UPDATE = "documents:update",
  DELETE = "documents:delete",
  DOWNLOAD = "documents:download",
}

/**
 * Interfaz para solicitudes relacionadas con documentos
 */
export interface DocumentsRequests {
  [DocumentsChannels.GET_ALL]: {
    request: { filters?: any };
    response: DocumentsListResponse;
  };
  [DocumentsChannels.GET_BY_ID]: {
    request: { id: string };
    response: { document: any };
  };
  [DocumentsChannels.UPDATE]: {
    request: UpdateDocumentMetadataRequest;
    response: { success: boolean; document: any; message?: string };
  };
  [DocumentsChannels.DELETE]: {
    request: { id: string };
    response: { success: boolean; message?: string };
  };
  [DocumentsChannels.OPEN]: {
    request: { id: string };
    response: { success: boolean; path: string; message?: string };
  };
  [DocumentsChannels.SAVE]: {
    request: { contractId?: string; supplementId?: string; description?: string; isPublic?: boolean; tags?: string[] };
    response: { success: boolean; document?: any; message?: string };
  };
  [DocumentsChannels.DOWNLOAD]: {
    request: { id: string; destination?: string };
    response: { success: boolean; path?: string; message?: string };
  };
} 