import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Rutas absolutas para los archivos de estilos
const resolvePath = (p: string) => path.resolve(__dirname, p)

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('i-')
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        charset: false
      }
    },
    devSourcemap: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue'],
          'styles': ['./src/styles/tailwind.css']
        }
      }
    }
  }
})
