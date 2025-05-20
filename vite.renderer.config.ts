import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  root: path.resolve(__dirname, "renderer"),
  base: "./",
  publicDir: path.resolve(__dirname, "renderer/public"),
  build: {
    outDir: path.resolve(__dirname, "dist/renderer"),
    assetsDir: ".",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "renderer/index.html"),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "renderer"),
      "@components": path.resolve(__dirname, "renderer/components"),
      "@lib": path.resolve(__dirname, "renderer/lib"),
      "@store": path.resolve(__dirname, "renderer/store"),
      "@styles": path.resolve(__dirname, "renderer/styles"),
      "@app": path.resolve(__dirname, "renderer/app"),
    },
  },
});
