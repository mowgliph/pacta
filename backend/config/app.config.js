import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiVersion: process.env.API_VERSION || 'v1',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,

  // Database Configuration
  database: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || path.join(__dirname, '../database/pacta.sqlite'),
    logging: process.env.DB_LOGGING === 'true'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || path.join(__dirname, '../logs/app.log')
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 600,
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD, 10) || 120
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    enableHttps: process.env.ENABLE_HTTPS === 'true',
    sslKeyPath: process.env.SSL_KEY_PATH,
    sslCertPath: process.env.SSL_CERT_PATH
  },

  // Feature Flags
  features: {
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
    enableCompression: process.env.ENABLE_COMPRESSION === 'true',
    enableCache: process.env.ENABLE_CACHE === 'true',
    enableLogging: process.env.ENABLE_LOGGING === 'true'
  },

  // External Services
  external: {
    apiKey: process.env.EXTERNAL_API_KEY,
    apiUrl: process.env.EXTERNAL_API_URL
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY
  },

  // Development Tools
  development: {
    enableDebugTools: process.env.ENABLE_DEBUG_TOOLS === 'true',
    enableTestRoutes: process.env.ENABLE_TEST_ROUTES === 'true'
  }
};

// Validate required configuration
const requiredConfig = [
  'jwt.secret',
  'jwt.refreshSecret',
  'email.host',
  'email.user',
  'email.pass',
  'email.from'
];

const missingConfig = requiredConfig.filter(key => {
  const value = key.split('.').reduce((obj, k) => obj && obj[k], config);
  return !value;
});

if (missingConfig.length > 0) {
  throw new Error(`Missing required configuration: ${missingConfig.join(', ')}`);
}

export default config; 