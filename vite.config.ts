import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { UserConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'src', 'renderer'),
  base: './',
  publicDir: 'public',
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
    target: 'esnext'
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js')
  }
}) as UserConfig;