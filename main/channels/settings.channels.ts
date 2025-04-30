/**
 * Canales IPC relacionados con configuración del sistema
 */
import {
  UpdateEmailConfigRequest,
  UpdateSystemSettingRequest,
  UpdateUserPreferenceRequest,
} from "../../shared/types";
import { ipcMain } from "electron";
import { SettingsService } from "../services/settings.service";

/**
 * Enumera los canales IPC para configuración
 */
export enum SettingsChannels {
  GET_USER_PREFERENCES = "settings:getUserPreferences",
  UPDATE_USER_PREFERENCES = "settings:updateUserPreferences",
  GET_EMAIL_CONFIG = "settings:getEmailConfig",
  UPDATE_EMAIL_CONFIG = "settings:updateEmailConfig",
  GET_SYSTEM = "settings:getSystem",
  UPDATE_SYSTEM = "settings:updateSystem",
}

/**
 * Interfaz para solicitudes relacionadas con configuración
 */
export interface SettingsRequests {
  [SettingsChannels.GET_USER_PREFERENCES]: {
    request: { userId: string };
    response: { preferences: any };
  };
  [SettingsChannels.UPDATE_USER_PREFERENCES]: {
    request: UpdateUserPreferenceRequest;
    response: { success: boolean; preferences: any; message?: string };
  };
  [SettingsChannels.GET_EMAIL_CONFIG]: {
    request: void;
    response: { config: any };
  };
  [SettingsChannels.UPDATE_EMAIL_CONFIG]: {
    request: UpdateEmailConfigRequest;
    response: { success: boolean; config: any; message?: string };
  };
  [SettingsChannels.GET_SYSTEM]: {
    request: { category?: string };
    response: { settings: any[] };
  };
  [SettingsChannels.UPDATE_SYSTEM]: {
    request: UpdateSystemSettingRequest;
    response: { success: boolean; setting: any; message?: string };
  };
}

export function registerSettingsChannels() {
  ipcMain.handle("settings:get", async () => {
    return await SettingsService.getSettings();
  });

  ipcMain.handle("settings:update", async (_, settings: any) => {
    return await SettingsService.updateSettings(settings);
  });

  ipcMain.handle("settings:reset", async () => {
    return await SettingsService.resetSettings();
  });
}
