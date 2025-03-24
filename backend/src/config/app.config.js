/**
 * Configuración centralizada de la aplicación
 * Todos los valores por defecto son sobrescribibles mediante variables de entorno
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Configuración por defecto
const config = {
  // Entorno
  nodeEnv: process.env.NODE_ENV || 'development',

  // Servidor
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  apiPrefix: process.env.API_PREFIX || '/api',

  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'pacta',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.DB_LOGGING === 'true',
    sync: process.env.DB_SYNC === 'true',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '5', 10),
      min: parseInt(process.env.DB_POOL_MIN || '0', 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
    },
  },

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Cors
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Limites
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 solicitudes
  },

  // Logs
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '5m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
    console: process.env.LOG_CONSOLE !== 'false',
  },

  // Cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hora en segundos
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10), // 10 minutos en segundos
  },

  // Uploads
  uploads: {
    directory: process.env.UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5000000', 10), // 5MB
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ],
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || path.join(__dirname, '../logs/app.log'),
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 600,
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD, 10) || 120,
  },

  // Security
  security: {
    enableHttps: process.env.ENABLE_HTTPS === 'true',
    sslKeyPath: process.env.SSL_KEY_PATH,
    sslCertPath: process.env.SSL_CERT_PATH,
  },

  // Feature Flags
  features: {
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
    enableCompression: process.env.ENABLE_COMPRESSION === 'true',
    enableCache: process.env.ENABLE_CACHE === 'true',
    enableLogging: process.env.ENABLE_LOGGING === 'true',
  },

  // External Services
  external: {
    apiKey: process.env.EXTERNAL_API_KEY,
    apiUrl: process.env.EXTERNAL_API_URL,
  },

  // Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY,
  },

  // Development Tools
  development: {
    enableDebugTools: process.env.ENABLE_DEBUG_TOOLS === 'true',
    enableTestRoutes: process.env.ENABLE_TEST_ROUTES === 'true',
  },
};

// Validate required configuration
const requiredConfig = [
  'jwt.secret',
  'jwt.refreshSecret',
  'email.host',
  'email.user',
  'email.pass',
  'email.from',
];

const missingConfig = requiredConfig.filter(key => {
  const value = key.split('.').reduce((obj, k) => obj && obj[k], config);
  return !value;
});

if (missingConfig.length > 0) {
  throw new Error(`Missing required configuration: ${missingConfig.join(', ')}`);
}

export default config;
