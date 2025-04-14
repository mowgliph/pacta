import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'src', 'renderer'),
  publicDir: 'public',
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
  }
});