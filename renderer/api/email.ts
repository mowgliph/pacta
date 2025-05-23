import { ApiResponse } from './common';

export interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  security: 'tls' | 'ssl' | 'none';
  isEnabled?: boolean;
  lastTested?: string;
  lastError?: string;
}

export interface EmailApi {
  getSettings: () => Promise<ApiResponse<EmailSettings>>;
  updateSettings: (settings: Partial<EmailSettings>) => Promise<ApiResponse<EmailSettings>>;
  testConnection: () => Promise<ApiResponse<boolean>>;
}
