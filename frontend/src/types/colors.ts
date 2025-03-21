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
  textTertiary: string;
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

  // Colores desde SCSS - Actualizado para usar valores desde c.$color-*
  return {
    // Colores principales
    primary: getCssVar('primary'),
    primaryLight: getCssVar('primary-light'),
    primaryDark: getCssVar('primary-dark'),

    // Colores secundarios
    secondary: getCssVar('secondary'),
    secondaryLight: getCssVar('secondary-light'),
    secondaryDark: getCssVar('secondary-dark'),

    // Colores de acento
    accent: getCssVar('accent'),
    accentLight: getCssVar('accent-light'),
    accentDark: getCssVar('accent-dark'),

    // Colores de estado
    success: getCssVar('success'),
    warning: getCssVar('warning'),
    error: getCssVar('error'),
    info: getCssVar('info'),

    // Colores de texto
    textPrimary: getCssVar('text-primary'),
    textSecondary: getCssVar('text-secondary'),
    textTertiary: getCssVar('text-tertiary'),
    textLight: getCssVar('text-light'),

    // Colores de fondo y superficie
    background: getCssVar('background'),
    surface: getCssVar('surface'),
    surfaceHover: getCssVar('surface-hover'),

    // Colores de división y bordes
    divider: getCssVar('divider'),
    border: getCssVar('border'),

    // Color de hover
    hover: getCssVar('hover')
  };
}; 