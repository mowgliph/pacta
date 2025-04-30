import { app } from "electron";
import path from "path";
import fs from "fs";
import { Settings, UpdateSettingsResponse } from "../../shared/types/settings";

export class SettingsService {
  private static readonly SETTINGS_PATH = path.join(
    app.getPath("userData"),
    "settings.json"
  );

  static async getSettings(): Promise<Settings> {
    try {
      if (!fs.existsSync(this.SETTINGS_PATH)) {
        return this.getDefaultSettings();
      }

      const settingsData = await fs.promises.readFile(
        this.SETTINGS_PATH,
        "utf-8"
      );
      return JSON.parse(settingsData);
    } catch (error) {
      console.error("Error al leer la configuración:", error);
      return this.getDefaultSettings();
    }
  }

  static async updateSettings(
    settings: Partial<Settings>
  ): Promise<UpdateSettingsResponse> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };

      await fs.promises.writeFile(
        this.SETTINGS_PATH,
        JSON.stringify(updatedSettings, null, 2)
      );

      return {
        success: true,
        settings: updatedSettings,
      };
    } catch (error) {
      console.error("Error al actualizar la configuración:", error);
      return {
        success: false,
        error: "Error al actualizar la configuración",
      };
    }
  }

  static async resetSettings(): Promise<UpdateSettingsResponse> {
    try {
      const defaultSettings = this.getDefaultSettings();
      await fs.promises.writeFile(
        this.SETTINGS_PATH,
        JSON.stringify(defaultSettings, null, 2)
      );

      return {
        success: true,
        settings: defaultSettings,
      };
    } catch (error) {
      console.error("Error al resetear la configuración:", error);
      return {
        success: false,
        error: "Error al resetear la configuración",
      };
    }
  }

  private static getDefaultSettings(): Settings {
    return {
      theme: "light",
      language: "es",
      notifications: {
        enabled: true,
        sound: true,
      },
      export: {
        defaultFormat: "excel",
        defaultPath: path.join(app.getPath("documents"), "PactaExports"),
      },
    };
  }
}
