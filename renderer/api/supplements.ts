import { ApiResponse } from './common';

export interface Supplement {
  id: string;
  contractId: string;
  field: string;
  oldValue: string;
  newValue: string;
  description: string;
  createdAt: string;
  fileName?: string;
}

export interface SupplementsResponse {
  success: boolean;
  data: Supplement[];
  error?: {
    message: string;
    code?: string;
  };
}

export interface SupplementsAPI {
  export: (supplementId: string, filePath: string) => Promise<SupplementsResponse>;
}
