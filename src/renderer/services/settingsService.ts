import { electronAPI } from '@/renderer/api/electronAPI';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from: string;
  enabled: boolean;
}

const settingsService = {
  getSMTPConfig: async (): Promise<SMTPConfig> => {
    return electronAPI.smtp.getConfig();
  },
  updateSMTPConfig: async (config: SMTPConfig): Promise<SMTPConfig> => {
    return electronAPI.smtp.updateConfig(config);
  },
  testSMTPConnection: async (config: SMTPConfig): Promise<{ success: boolean; message: string }> => {
    return electronAPI.smtp.testConnection(config);
  }
};

export default settingsService;
