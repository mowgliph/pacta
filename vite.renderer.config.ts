import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  root: path.resolve(__dirname, "renderer"),
  publicDir: path.resolve(__dirname, "renderer/public"),
  base: "./",
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "renderer/components"),
      "@lib": path.resolve(__dirname, "renderer/lib"),
      "@store": path.resolve(__dirname, "renderer/store"),
      "@styles": path.resolve(__dirname, "renderer/styles"),
      "@app": path.resolve(__dirname, "renderer/app"),
    },
  },
});
