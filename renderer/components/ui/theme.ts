/**
 * Sistema de diseño para PACTA
 * Definición de tokens visuales, colores, espaciados y tipografía
 */

/**
 * Paleta de colores principal
 */
export const colors = {
  primary: {
    50: "#D6E8EE",
    100: "#97CADB",
    200: "#018ABE",
    300: "#02457A",
    400: "#001B48"
  },
  success: {
    50: "#E6F6EC",
    100: "#C3EBD4",
    200: "#92DAB0",
    300: "#60C88C",
    400: "#3BB26F",
    500: "#2F9A5C",
    600: "#237F49",
    700: "#186636",
    800: "#0D4C23",
    900: "#043311"
  },
  warning: {
    50: "#FEF6E6",
    100: "#FEE7B8",
    200: "#FDD88A",
    300: "#FCC95C",
    400: "#FBBA2E",
    500: "#F9A826",
    600: "#D88C1B",
    700: "#B87112",
    800: "#975709",
    900: "#754200"
  },
  error: {
    50: "#FEE7E7",
    100: "#FCC5C5",
    200: "#FA9E9E",
    300: "#F87878",
    400: "#F65151",
    500: "#F42B2B",
    600: "#D91F1F",
    700: "#B61616",
    800: "#930E0E",
    900: "#700606"
  },
  neutral: {
    50: "#F5F5F5",
    100: "#EEEEEE",
    200: "#E0E0E0",
    300: "#BBBBBB",
    400: "#757575",
    500: "#333333",
    600: "#292929",
    700: "#1F1F1F",
    800: "#141414",
    900: "#0A0A0A"
  }
};

/**
 * Sistema de espaciado
 */
export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
  xxxl: "64px"
};

/**
 * Radios de borde
 */
export const borderRadius = {
  xs: "2px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  xxl: "24px",
  round: "9999px"
};

/**
 * Sombras
 */
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  outline: "0 0 0 3px rgba(1, 138, 190, 0.5)"
};

/**
 * Sistema tipográfico
 */
export const typography = {
  fontFamily: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  fontSizes: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    md: "1rem",       // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem",// 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem",    // 48px
    "6xl": "4rem"     // 64px
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeights: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2"
  }
};

/**
 * Transiciones
 */
export const transitions = {
  easing: {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
  },
  duration: {
    shortest: "100ms",
    shorter: "150ms",
    short: "200ms",
    standard: "300ms",
    complex: "400ms",
    enteringScreen: "225ms",
    leavingScreen: "195ms"
  }
};

/**
 * Breakpoints para responsive design
 */
export const breakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
};

/**
 * Z-index para gestionar capas
 */
export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
}; 