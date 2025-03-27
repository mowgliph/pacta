import { env } from './env'

export const API_CONFIG = {
  baseURL: env.VITE_API_URL,
  version: env.VITE_API_VERSION,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}