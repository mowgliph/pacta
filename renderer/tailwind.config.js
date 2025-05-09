/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
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
        // Colores principales de PACTA como objeto separado para prevenir conflictos
        "primary-dark": "#001B48", // Azul Marino Oscuro
        "primary-medium": "#018ABE", // Azul Medio
        "primary-light": "#97CADB", // Azul Claro
        "primary-lightest": "#D6E8EE", // Azul Muy Claro

        // Colores funcionales
        success: "#4CAF50",
        warning: "#FF9800",
        error: "#F44336",
        // Colores neutrales
        neutral: {
          dark: "#333333",
          medium: "#757575",
          light: "#F5F5F5",
        },
        // Asegurar que los colores base estén disponibles
        white: "#FFFFFF",
        black: "#000000",
        transparent: "transparent",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
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
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
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
