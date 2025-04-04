import { useContext } from 'react';
import { ThemeProviderContext } from '@/components/theme-provider';

/**
 * Hook para acceder y manipular el tema de la aplicación
 * Debe usarse dentro de un ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme debe ser usado dentro de un ThemeProvider");
  }
  
  return context;
}

/**
 * Función para obtener el tema almacenado en localStorage
 * @returns El tema almacenado o 'light' como valor por defecto
 */
export function getThemeFromStorage(): 'dark' | 'light' | 'system' {
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'light';
}

/**
 * Aplica un tema al elemento html
 * @param theme Tema a aplicar
 */
export function applyTheme(theme: 'dark' | 'light' | 'system') {
  const root = window.document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  const newTheme = theme === 'system' ? systemTheme : theme;
  
  root.classList.remove('light', 'dark');
  root.classList.add(newTheme);
  
  localStorage.setItem('theme', theme);
}