import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/*'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    testTransformMode: {
      web: ['.[jt]sx']
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__mocks__/*',
        '**/node_modules/**'
      ]
    }
  }
})
