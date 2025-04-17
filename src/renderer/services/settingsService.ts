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

export interface AppConfig {
  enableLandingPage: boolean;
  enablePublicDashboard: boolean;
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
  },
  getAppConfig: async (): Promise<AppConfig> => {
    return electronAPI.settings.getAppConfig() || { 
      enableLandingPage: false, 
      enablePublicDashboard: false 
    };
  },
  updateAppConfig: async (config: AppConfig): Promise<AppConfig> => {
    return electronAPI.settings.updateAppConfig(config);
  }
};

export default settingsService;
