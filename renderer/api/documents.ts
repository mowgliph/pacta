import { ApiResponse } from './common';

export interface Document {
  id: string;
  contractId: string;
  // Otros campos del documento
}

export interface DocumentsApi {
  getByContract: (id: string) => Promise<ApiResponse<Document>>;
}
