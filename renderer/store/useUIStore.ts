import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Tipos para el estado de la UI
 */
interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Modo oscuro/claro
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  
  // Preferencias de visualización
  tableCompact: boolean;
  setTableCompact: (compact: boolean) => void;
  
  // Densidad de elementos UI
  density: "compact" | "normal" | "spacious";
  setDensity: (density: "compact" | "normal" | "spacious") => void;
  
  // Notificaciones de la app
  showNotificationsPanel: boolean;
  toggleNotificationsPanel: () => void;
  setShowNotificationsPanel: (show: boolean) => void;
}

/**
 * Store para la interfaz de usuario
 * Gestiona el estado visual y las preferencias de interfaz
 */
export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      sidebarOpen: false,
      theme: "light",
      tableCompact: false,
      density: "normal",
      showNotificationsPanel: false,
      
      // Métodos para sidebar
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Métodos para tema
      setTheme: (theme) => set({ theme }),
      
      // Métodos para configuración de tablas
      setTableCompact: (tableCompact) => set({ tableCompact }),
      
      // Métodos para densidad de UI
      setDensity: (density) => set({ density }),
      
      // Métodos para panel de notificaciones
      setShowNotificationsPanel: (show) => set({ showNotificationsPanel: show }),
      toggleNotificationsPanel: () => set((state) => ({ 
        showNotificationsPanel: !state.showNotificationsPanel 
      })),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        tableCompact: state.tableCompact,
        density: state.density
      }),
    }
  )
);

/**
 * Selector para obtener el tema actual
 */
export const selectTheme = (state: UIState) => state.theme;

/**
 * Selector para obtener el estado de la barra lateral
 */
export const selectSidebarOpen = (state: UIState) => state.sidebarOpen; 