import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import path from "path";

// Resolve paths from project root
const projectRoot = path.resolve(__dirname, "..");

const config: Config = {
  content: [
    path.join(projectRoot, "index.html"),
    path.join(projectRoot, "renderer", "**", "*.{js,ts,jsx,tsx}"),
    path.join(projectRoot, "renderer", "components", "**", "*.{js,ts,jsx,tsx}"),
    path.join(projectRoot, "renderer", "pages", "**", "*.{js,ts,jsx,tsx}"),
    path.join(projectRoot, "renderer", "styles", "**", "*.css"),
  ],
  darkMode: "class",
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
        // Colores personalizados
        "primary-dark": "#001B48",
        "primary-medium": "#018ABE",
        "primary-light": "#97CADB",
        "primary-lightest": "#D6E8EE",
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        neutral: {
          dark: "#333333",
          medium: "#757575",
          light: "#F5F5F5",
        },
        white: "#FFFFFF",
        black: "#000000",
        transparent: "transparent",
        
        // Variables CSS para temas
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        
        // Colores semánticos
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        // Añadir app-background como color personalizado
        app: {
          background: "hsl(var(--app-background) / <alpha-value>)",
        },
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],         // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],     // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],        // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],     // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],      // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],       // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],  // 30px
        "4xl": ["2rem", { lineHeight: "2.5rem" }],       // 32px
        "5xl": ["2.5rem", { lineHeight: "3rem" }],       // 40px
        "6xl": ["3rem", { lineHeight: "3.5rem" }],       // 48px
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "8px",
        button: "6px",
        input: "6px",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        input: "0 0 0 2px rgba(1, 138, 190, 0.25)",
      },
      ringColor: {
        ring: "hsl(var(--ring))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.7s cubic-bezier(0.4,0,0.2,1)",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.4,0,0.2,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
