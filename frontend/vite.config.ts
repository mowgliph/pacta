import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    /* Alias @/ comentado para usar rutas relativas
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
    */
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use './src/assets/styles/_colors' as *;
          @use './src/assets/styles/_variables' as *;
          @use './src/assets/styles/_mixins' as *;
        `
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
