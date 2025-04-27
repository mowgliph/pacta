import React, { useEffect } from 'react';
import { useThemeStore, useSystemThemeDetection, syncWithElectron } from '../../store/theme-store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = React.memo(function ThemeProvider({ children }: ThemeProviderProps) {
  // Usar el hook personalizado para detectar el tema del sistema
  const { theme, resolvedTheme } = useSystemThemeDetection();
  const isHydrated = useThemeStore((state) => state.isHydrated);
  
  // Efecto para aplicar el tema al DOM
  useEffect(() => {
    // Solo aplicar después de que se haya hidratado el estado
    if (!isHydrated) return;
    
    // Determinar qué tema aplicar
    const themeToApply = theme === 'system' ? resolvedTheme : theme;
    
    // Aplicar el tema al elemento HTML
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeToApply);
    
    // También establecer el atributo data-theme para componentes que lo usen
    root.setAttribute('data-theme', themeToApply);
    
    // Sincronizar con Electron
    syncWithElectron();
    
  }, [theme, resolvedTheme, isHydrated]);
  
  // Si aún no se ha hidratado el tema desde el localStorage, usar un valor predeterminado
  useEffect(() => {
    if (!isHydrated) {
      const root = document.documentElement;
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }
  }, [isHydrated]);
  
  return (
    <>
      {children}
      {/* Indicador visual del tema actual (opcional) */}
      <ThemeIndicator />
    </>
  );
});

// Componente para mostrar un indicador visual del tema actual
const ThemeIndicator = React.memo(function ThemeIndicator() {
  const { theme, resolvedTheme } = useSystemThemeDetection();
  const themeToDisplay = theme === 'system' ? `Sistema (${resolvedTheme})` : theme;
  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  
  // Solo muestra el indicador en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="theme-indicator" title={`Tema actual: ${themeToDisplay}`}>
      {currentTheme === 'light' ? (
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="M4.93 4.93l1.41 1.41"></path>
          <path d="M17.66 17.66l1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="M6.34 17.66l-1.41 1.41"></path>
          <path d="M19.07 4.93l-1.41 1.41"></path>
        </svg>
      ) : (
        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      )}
    </div>
  );
}); 