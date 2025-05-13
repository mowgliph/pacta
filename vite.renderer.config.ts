import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
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
