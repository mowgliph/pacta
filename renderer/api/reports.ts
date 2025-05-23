import { ApiResponse } from './common';

export interface ReportTemplate {
  id: string;
  name: string;
  content: string;
}

export interface ReportResponse {
  success: boolean;
  data: {
    filePath: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface ReportsApi {
  exportPDF: (data: any, template?: string) => Promise<ReportResponse>;
  exportExcel: (data: any, template?: string) => Promise<ReportResponse>;
  getTemplates: () => Promise<ReportTemplate[]>;
  saveTemplate: (name: string, content: string) => Promise<void>;
  deleteTemplate: (name: string) => Promise<void>;
}
