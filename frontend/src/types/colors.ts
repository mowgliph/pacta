// Definición de tipos para los colores
export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textLight: string;
  background: string;
  surface: string;
  surfaceHover: string;
  divider: string;
  border: string;
  hover: string;
}

// Función para obtener los colores del sistema
export const useColors = (): ColorPalette => {
  // Obtener las variables CSS personalizadas
  const getCssVar = (name: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${name}`)
      .trim();
  };

  // Obtener el tema actual
  const isDarkTheme = document.documentElement.classList.contains('dark-theme');

  return {
    // Colores principales
    primary: getCssVar('primary'),
    primaryLight: '#4791db', // Basado en $color-primary-light
    primaryDark: '#115293',  // Basado en $color-primary-dark

    // Colores secundarios
    secondary: '#424242',    // Basado en $color-secondary
    secondaryLight: '#6d6d6d', // Basado en $color-secondary-light
    secondaryDark: '#1b1b1b',  // Basado en $color-secondary-dark

    // Colores de acento
    accent: '#ff9800',       // Basado en $color-accent
    accentLight: '#ffb74d',  // Basado en $color-accent-light
    accentDark: '#f57c00',   // Basado en $color-accent-dark

    // Colores de estado
    success: '#4caf50',      // Basado en $color-success
    warning: '#ff9800',      // Basado en $color-warning
    error: '#f44336',        // Basado en $color-error
    info: '#2196f3',         // Basado en $color-info

    // Colores de texto
    textPrimary: isDarkTheme ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
    textSecondary: isDarkTheme ? 'rgba(255, 255, 255, 0.60)' : 'rgba(0, 0, 0, 0.60)',
    textDisabled: isDarkTheme ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)',
    textLight: '#ffffff',    // Basado en $color-text-light

    // Colores de fondo y superficie
    background: isDarkTheme ? '#121212' : '#f5f5f5',
    surface: isDarkTheme ? '#1e1e1e' : '#ffffff',
    surfaceHover: isDarkTheme ? '#363636' : '#f5f5f5',

    // Colores de división y bordes
    divider: 'rgba(0, 0, 0, 0.12)',  // Basado en $color-divider
    border: isDarkTheme ? '#404040' : '#e2e8f0',  // Basado en $color-border

    // Color de hover
    hover: 'rgba(25, 118, 210, 0.1)'  // Basado en $color-hover
  };
}; 