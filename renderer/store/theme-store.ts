import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';
import { useEffect, useState, useCallback } from 'react';
import React, { memo, ReactNode } from 'react';

// Tipo para los temas disponibles
export type Theme = 'light' | 'dark' | 'system';

// Interface para el estado del tema
export interface ThemeState {
  theme: Theme;
  isDark: boolean;
  isHydrated: boolean; // Añadido para compatibilidad con ThemeProvider
  resolvedTheme: 'light' | 'dark'; // Añadido para compatibilidad con ThemeProvider
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hydrateTheme: () => void;
  syncWithElectron: () => void;
}

// Store de tema con persistencia
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system' as Theme,
      isDark: false,
      isHydrated: false,  // Inicializado como false
      resolvedTheme: 'light', // Valor predeterminado
      
      setTheme: (theme: Theme) => {
        const isDark = theme === 'dark' || 
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        const resolvedTheme = isDark ? 'dark' : 'light';
          
        // Aplicar tema al DOM
        document.documentElement.classList.toggle('dark', isDark);
        
        // Sincronizar con el sistema y preferencias de usuario
        if (window.electron?.setTheme) {
          window.electron.setTheme(theme);
        }
        
        // Disparar evento personalizado para componentes que necesiten saber sobre cambios de tema
        window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme, isDark } }));
        
        set({ theme, isDark, resolvedTheme, isHydrated: true });
      },
      
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },
      
      hydrateTheme: () => {
        const { theme } = get();
        get().setTheme(theme);
        set({ isHydrated: true });
      },
      
      syncWithElectron: () => {
        if (window.electron?.onThemeChange) {
          // Eliminar cualquier listener previo para evitar duplicados
          window.electron.removeThemeListeners?.();
          
          // Escuchar cambios de tema desde el proceso principal
          window.electron.onThemeChange((newTheme: Theme) => {
            set({ theme: newTheme });
            get().hydrateTheme();
          });
        }
      }
    }),
    {
      name: 'pacta-theme-storage',
      storage: createJSONStorage(() => {
        // Usar localStorage con fallback a memoria
        try {
          return localStorage;
        } catch (error) {
          // Fallback a almacenamiento en memoria si localStorage no está disponible
          let storage: Record<string, string> = {};
          return {
            getItem: (name: string) => storage[name] || null,
            setItem: (name: string, value: string) => {
              storage[name] = value;
            },
            removeItem: (name: string) => {
              delete storage[name];
            }
          };
        }
      }),
      // Solo persistir la configuración del tema, no el estado calculado
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Cuando se rehidrata el almacenamiento, marcamos el estado como hidratado
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);

/**
 * Hook para detectar cambios en el tema del sistema
 * @returns boolean true si el tema del sistema es oscuro
 */
export const useSystemTheme = () => {
  const [systemIsDark, setSystemIsDark] = useState(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Función de cambio de tema del sistema (memoizada para prevenir recreaciones)
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
      
      // Si el tema actual es "system", actualizar el tema
      const { theme, setTheme } = useThemeStore.getState();
      if (theme === 'system') {
        setTheme('system');
      }
    };
    
    // Suscribirse a cambios en el tema del sistema
    mediaQuery.addEventListener('change', handleChange);
    
    // Limpiar suscripción
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemIsDark;
};

/**
 * Hook para detección de tema del sistema con compatibilidad con el ThemeProvider existente
 */
export const useSystemThemeDetection = () => {
  const theme = useThemeStore(state => state.theme);
  const resolvedTheme = useThemeStore(state => state.resolvedTheme);
  return { theme, resolvedTheme };
};

/**
 * Hook para inicializar el tema
 */
export const useInitTheme = () => {
  const { theme, hydrateTheme, syncWithElectron } = useThemeStore();
  
  useEffect(() => {
    // Aplicar tema inicial
    hydrateTheme();
    
    // Sincronizar con Electron
    syncWithElectron();
    
    // Configurar método para comprobar si el tema es oscuro
    // Esto permite que los componentes memoizados determinen el tema actual sin rerenderizaciones
    window.isDarkTheme = () => {
      const state = useThemeStore.getState();
      return state.isDark;
    };
    
    // Almacenar la preferencia del tema cuando la ventana se cierre
    const handleBeforeUnload = () => {
      const { theme } = useThemeStore.getState();
      if (window.electron?.persistThemePreference) {
        window.electron.persistThemePreference(theme);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hydrateTheme, syncWithElectron]);
  
  return theme;
};

/**
 * Función para sincronizar con Electron, exportada para compatibilidad
 */
export const syncWithElectron = () => {
  useThemeStore.getState().syncWithElectron();
};

// Declarar la extensión del objeto window para TypeScript
declare global {
  interface Window {
    electron?: {
      setTheme: (theme: Theme) => void;
      onThemeChange: (callback: (theme: Theme) => void) => void;
      removeThemeListeners?: () => void;
      persistThemePreference?: (theme: Theme) => void;
      getSystemTheme?: () => Promise<'light' | 'dark'>;
    };
    isDarkTheme: () => boolean;
  }
}

// Exportar un componente envolvente memoizado para contextos que necesiten acceso al tema
// Este componente solo se renderizará cuando el tema cambie
interface ThemeAwareProps {
  children: (isDark: boolean) => ReactNode;
}

export const ThemeAware = memo(function ThemeAware({ children }: ThemeAwareProps) {
  const isDark = useThemeStore(state => state.isDark);
  return React.createElement(React.Fragment, null, children(isDark));
});

// Hook para usar el tema con componentes memoizados
export const useTheme = () => {
  const isDark = useThemeStore(state => state.isDark);
  const theme = useThemeStore(state => state.theme);
  const setTheme = useThemeStore(state => state.setTheme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  
  return { isDark, theme, setTheme, toggleTheme };
};

// Hook memoizado para escuchar cambios de tema sin causar rerenderizaciones
export const useThemeListener = (callback: (isDark: boolean) => void) => {
  const memoizedCallback = useCallback(callback, [callback]);
  
  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isDark: boolean }>;
      memoizedCallback(customEvent.detail.isDark);
    };
    
    window.addEventListener('theme-change', handleThemeChange);
    
    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
    };
  }, [memoizedCallback]);
};

// Exportar el componente ThemeProvider para inicializar el tema
export const ThemeProvider = function ThemeProvider({ children }: { children: ReactNode }) {
  useInitTheme();
  return React.createElement(React.Fragment, null, children);
}; 