import type { Config } from "tailwindcss";
import path from "path";
import animatePlugin from "tailwindcss-animate";

// Resolve paths from project root
const projectRoot = path.resolve(__dirname, "../");

const config: Config = {
  content: [
    path.join(projectRoot, "index.html"),
    path.join(projectRoot, "renderer", "**", "*.{js,ts,jsx,tsx}"),
    path.join(projectRoot, "renderer", "components", "**", "*.{js,ts,jsx,tsx}"),
    path.join(projectRoot, "renderer", "pages", "**", "*.{js,ts,jsx,tsx}"),
    path.join(projectRoot, "renderer", "styles", "**", "*.css"),
  ],
  plugins: [animatePlugin],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Paleta de colores principal
        primary: {
          DEFAULT: "#018ABE",    // Azul Medio
          light: "#D6E8EE",      // Azul Muy Claro
          dark: "#016B8F",       // Azul Oscuro (variante más oscura)
          hover: "#0277A6",      // Azul para hover
        },
        // Colores de fondo
        background: {
          DEFAULT: "#F8FAFC",   // Fondo principal ligeramente azulado
          paper: "#FFFFFF",       // Fondo de tarjetas y elementos elevados
          secondary: "#F1F5F9",  // Fondo secundario
        },
        // Colores de texto
        text: {
          primary: "#1E293B",    // Texto principal
          secondary: "#475569",  // Texto secundario
          disabled: "#94A3B8",   // Texto deshabilitado
          hint: "#64748B",       // Texto de ayuda
        },
        // Colores de estado
        success: {
          DEFAULT: "#10B981",    // Verde para éxito
          light: "#D1FAE5",      // Fondo claro para éxito
        },
        warning: {
          DEFAULT: "#F59E0B",    // Amarillo para advertencias
          light: "#FEF3C7",      // Fondo claro para advertencias
        },
        error: {
          DEFAULT: "#EF4444",    // Rojo para errores
          light: "#FEE2E2",      // Fondo claro para errores
        },
        // Bordes y divisiones
        border: "#E2E8F0",
        divider: "#E2E8F0",
        // Grises
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      // Bordes redondeados
      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
      // Sombras
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        hover: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
      // Animaciones
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-out": "fadeOut 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      // Tipografía
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },
      // Espaciado
      spacing: {
        px: "1px",
        0.5: "0.125rem",
        1: "0.25rem",
        1.5: "0.375rem",
        2: "0.5rem",
        2.5: "0.625rem",
        3: "0.75rem",
        3.5: "0.875rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
        11: "2.75rem",
        12: "3rem",
        14: "3.5rem",
        16: "4rem",
        20: "5rem",
        24: "6rem",
        28: "7rem",
        32: "8rem",
        36: "9rem",
        40: "10rem",
        44: "11rem",
        48: "12rem",
        52: "13rem",
        56: "14rem",
        60: "15rem",
        64: "16rem",
        72: "18rem",
        80: "20rem",
        96: "24rem",
      },
    },
    // Fuentes
    fontFamily: {
      sans: [
        'Inter',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace',
      ],
    },
  },
};

export default config;
