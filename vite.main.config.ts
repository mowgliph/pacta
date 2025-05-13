import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    outDir: "dist/main",
    lib: {
      entry: path.resolve(__dirname, "main/index.ts"),
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["electron", "electron-store", "electron-updater"],
      output: {
        entryFileNames: "[name].js",
      },
    },
    target: "node16",
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@main": path.resolve(__dirname, "main"),
    },
  },
});
