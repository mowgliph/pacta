import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  systemTheme: "light" | "dark";
  setTheme: (theme: Theme) => Promise<void>;
  init: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "system",
  systemTheme: "light",

  init: async () => {
    try {
      // Obtener tema guardado
      const savedTheme = (await window.Electron?.ipcRenderer.invoke(
        "theme:get-saved"
      )) as Theme;
      const systemTheme = (await window.Electron?.ipcRenderer.invoke(
        "theme:get-system"
      )) as "light" | "dark";

      set({ theme: savedTheme, systemTheme });

      // Escuchar cambios en el tema del sistema
      window.Electron?.ipcRenderer.on(
        "theme:system-changed",
        (_, newSystemTheme: "light" | "dark") => {
          set({ systemTheme: newSystemTheme });
        }
      );
    } catch (error) {
      console.error("Error initializing theme:", error);
    }
  },

  setTheme: async (theme) => {
    try {
      await window.Electron?.ipcRenderer.invoke("theme:set-app", theme);
      set({ theme });
    } catch (error) {
      console.error("Error setting theme:", error);
      throw error;
    }
  },
}));
