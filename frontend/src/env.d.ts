/// <reference types="vite/client" />

declare module '@env' {
  type ImportMetaEnv = {
    VITE_API_URL: string
    VITE_API_VERSION: string
    VITE_APP_NAME: string
    VITE_APP_DESCRIPTION: string
    VITE_APP_VERSION: string
    VITE_ENABLE_REGISTRATION: string
    VITE_ENABLE_EMAIL_VERIFICATION: string
    VITE_ENABLE_PASSWORD_RESET: string
    VITE_ENABLE_TWO_FACTOR: string
    VITE_ENABLE_ANALYTICS: string
    VITE_GOOGLE_ANALYTICS_ID: string
    VITE_SENTRY_DSN: string
    VITE_GOOGLE_MAPS_API_KEY: string
    VITE_RECAPTCHA_SITE_KEY: string
    VITE_MAX_FILE_SIZE: string
    VITE_ALLOWED_FILE_TYPES: string
    VITE_CACHE_TTL: string
    VITE_THEME: string
    VITE_LANGUAGE: string
    VITE_DATE_FORMAT: string
    VITE_TIME_FORMAT: string
    VITE_ENABLE_HTTPS: string
    VITE_CSP_ENABLED: string
    VITE_ENABLE_LAZY_LOADING: string
    VITE_ENABLE_CODE_SPLITTING: string
  }

  type ImportMeta = {
    readonly env: ImportMetaEnv
  }
}