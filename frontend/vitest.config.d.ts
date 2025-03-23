import { UserConfig } from 'vitest/config'

declare const config: UserConfig
export default config

// Tipos personalizados para la configuración de pruebas
declare module 'vitest/config' {
  interface UserConfig {
    test?: {
      environment?: string
      exclude?: string[]
      root?: string
      testTransformMode?: {
        web?: string[]
      }
      coverage?: {
        provider?: string
        reporter?: string[]
        exclude?: string[]
      }
      globals?: boolean
      setupFiles?: string[]
      include?: string[]
    }
  }
}
