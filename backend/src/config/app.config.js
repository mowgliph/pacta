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
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    provider: process.env.DATABASE_PROVIDER || 'sqlite',
    logging: process.env.DB_LOGGING === 'true',
    sync: process.env.DB_SYNC === 'true',
    backup: {
      enabled: process.env.DB_BACKUP_ENABLED === 'true',
      path: process.env.BACKUP_BASE_PATH || './data/backups',
      interval: parseInt(process.env.DB_BACKUP_INTERVAL || '86400', 10), // 24 horas
      keepDays: parseInt(process.env.BACKUP_AUTO_RETAIN_DAYS || '7', 10),
    },
  },

  // Añadir nueva sección específica para backups
  backup: {
    // Configuración general
    enabled: process.env.BACKUP_ENABLED === 'true',
    basePath: process.env.BACKUP_BASE_PATH || './data/backups',
    
    // Estructura de directorios
    directories: {
      auto: process.env.BACKUP_AUTO_DIR || 'automatic',
      manual: process.env.BACKUP_MANUAL_DIR || 'manual',
      temp: process.env.BACKUP_TEMP_DIR || 'temp',
    },

    // Configuración de retención
    retention: {
      autoBackupDays: parseInt(process.env.BACKUP_AUTO_RETAIN_DAYS || '7', 10),
      manualBackupCount: parseInt(process.env.BACKUP_MANUAL_RETAIN_COUNT || '10', 10),
      minSpace: process.env.BACKUP_MIN_SPACE || '500mb',
    },

    // Configuración de compresión
    compression: {
      enabled: process.env.BACKUP_COMPRESSION_ENABLED === 'true',
      level: parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6', 10),
      algorithm: process.env.BACKUP_COMPRESSION_ALGO || 'zip',
    },

    // Configuración de cifrado
    encryption: {
      enabled: process.env.BACKUP_ENCRYPTION_ENABLED === 'true',
      algorithm: process.env.BACKUP_ENCRYPTION_ALGO || 'aes-256-gcm',
      keySize: parseInt(process.env.BACKUP_ENCRYPTION_KEY_SIZE || '32', 10),
    },

    // Configuración de programación
    schedule: {
      time: process.env.BACKUP_SCHEDULE_TIME || '00:00',
      days: (process.env.BACKUP_SCHEDULE_DAYS || '0,1,2,3,4,5,6').split(',').map(Number),
      timezone: process.env.BACKUP_TIMEZONE || 'UTC',
    },

    // Configuración de notificaciones
    notifications: {
      onSuccess: process.env.BACKUP_NOTIFY_SUCCESS === 'true',
      onError: process.env.BACKUP_NOTIFY_ERROR === 'true',
      onWarning: process.env.BACKUP_NOTIFY_WARNING === 'true',
    },
  },

  // Modo Offline
  offline: {
    enabled: process.env.IS_OFFLINE_MODE === 'true',
    syncInterval: process.env.SYNC_INTERVAL || '30m',
    maxOfflineDays: parseInt(process.env.MAX_OFFLINE_DAYS || '30', 10),
    storage: {
      path: process.env.LOCAL_STORAGE_PATH || './data/storage',
      maxSize: process.env.STORAGE_MAX_SIZE || '1gb',
      compressFiles: process.env.STORAGE_COMPRESS_FILES === 'true',
    },
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',           // Duración normal (1 día)
    longExpiresIn: process.env.JWT_LONG_EXPIRES_IN || '30d', // Larga duración para "recordarme" (30 días)
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Duración del refresh token
    cookieName: 'jwt',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  },

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
    file: process.env.LOG_FILE || './data/logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '5m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
    console: process.env.LOG_CONSOLE !== 'false',
  },

  // Archivos
  files: {
    uploadDir: process.env.UPLOAD_DIR || './data/uploads',
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,txt').split(','),
    compression: {
      enabled: process.env.FILE_COMPRESSION_ENABLED === 'true',
      level: parseInt(process.env.FILE_COMPRESSION_LEVEL || '6', 10),
    },
  },

  // Seguridad
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
    saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
    sessionSecret: process.env.SESSION_SECRET,
    enableHttps: process.env.ENABLE_HTTPS === 'true',
    sslKeyPath: process.env.SSL_KEY_PATH,
    sslCertPath: process.env.SSL_CERT_PATH,
  },

  // Monitoreo
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    interval: parseInt(process.env.MONITORING_INTERVAL || '60000', 10), // 1 minuto
    metrics: {
      cpu: process.env.MONITOR_CPU === 'true',
      memory: process.env.MONITOR_MEMORY === 'true',
      storage: process.env.MONITOR_STORAGE === 'true',
    },
  },

  // Sincronización
  sync: {
    enabled: process.env.SYNC_ENABLED === 'true',
    retryAttempts: parseInt(process.env.SYNC_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.SYNC_RETRY_DELAY || '300000', 10), // 5 minutos
    conflictResolution: process.env.SYNC_CONFLICT_RESOLUTION || 'latest', // latest, manual
  },
};

// Validate required configuration
const requiredConfig = [
  'backup.basePath',
  'security.sessionSecret',
  'jwt.secret',
  'jwt.refreshSecret',
];

const missingConfig = requiredConfig.filter(key => {
  const value = key.split('.').reduce((obj, k) => obj && obj[k], config);
  return !value;
});

if (missingConfig.length > 0) {
  throw new Error(`Missing required configuration: ${missingConfig.join(', ')}`);
}

export default config;
