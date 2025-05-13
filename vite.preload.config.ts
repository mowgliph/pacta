import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    outDir: "dist/preload",
    lib: {
      entry: path.resolve(__dirname, "main/preload.ts"),
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["electron"],
      output: {
        entryFileNames: "[name].cjs",
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
