import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useStore } from '@/store';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'pacta-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  // Usar el tema del store
  const { theme: storeTheme, setTheme: setStoreTheme } = useStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Eliminar clases antiguas
    root.classList.remove('light', 'dark');

    // Si es sistema, determinar según preferencia
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      
      root.classList.add(systemTheme);
      setStoreTheme(systemTheme);
      return;
    }

    // Añadir la clase del tema
    root.classList.add(theme);
    setStoreTheme(theme);
  }, [theme, setStoreTheme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider");

  return context;
}; 