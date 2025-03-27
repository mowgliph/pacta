interface ImportMetaEnv {
  VITE_API_URL: string
  VITE_API_VERSION: string
}

export const env = {
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  VITE_API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
} as const

export type Env = typeof env