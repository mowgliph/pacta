import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Rutas absolutas para los archivos de estilos
const resolvePath = (p: string) => path.resolve(__dirname, p)

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    // Removemos las importaciones globales para evitar conflictos
    // y usamos en su lugar importaciones locales en cada componente
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Configuración de proxy para peticiones API
      }
    }
  }
})
