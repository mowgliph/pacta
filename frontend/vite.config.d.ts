import { UserConfig } from 'vite'

declare const config: UserConfig
export default config

// Tipos personalizados para la configuración
declare module 'vite' {
  interface UserConfig {
    optimizeDeps?: {
      include?: string[]
      exclude?: string[]
    }
    build?: {
      sourcemap?: boolean
      cssCodeSplit?: boolean
      minify?: 'terser' | boolean
      terserOptions?: {
        compress?: {
          drop_console?: boolean
          drop_debugger?: boolean
        }
      }
      rollupOptions?: {
        output?: {
          manualChunks?: Record<string, string[]>
          chunkFileNames?: string
          entryFileNames?: string
          assetFileNames?: string
        }
      }
    }
  }
}
