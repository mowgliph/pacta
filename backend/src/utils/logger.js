import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import config from '../config/app.config.js';

// Crear directorio de logs si no existe
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Determinar el nivel de log basado en el ambiente
const logLevel = config.env === 'production' ? 'info' : 'debug';

// Formato para logs en consola (desarrollo)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

// Formato para logs en archivos (producción)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Configurar transports
const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Configuración básica para todos los archivos de log rotatorios
const dailyRotateFileConfig = {
  format: fileFormat,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Mantener logs por 14 días
  dirname: logDir,
};

// Agregar log a archivo si estamos en producción o si está configurado explícitamente
if (config.env === 'production' || config.logging?.files) {
  // Archivo de log para errores
  transports.push(
    new winston.transports.DailyRotateFile({
      ...dailyRotateFileConfig,
      filename: 'error-%DATE%.log',
      level: 'error',
    })
  );

  // Archivo para todos los logs
  transports.push(
    new winston.transports.DailyRotateFile({
      ...dailyRotateFileConfig,
      filename: 'combined-%DATE%.log',
    })
  );

  // Archivo específico para accesos/peticiones HTTP
  transports.push(
    new winston.transports.DailyRotateFile({
      ...dailyRotateFileConfig,
      filename: 'http-%DATE%.log',
      level: 'http',
    })
  );

  // Archivo específico para información de debug (solo en desarrollo)
  if (config.env !== 'production') {
    transports.push(
      new winston.transports.DailyRotateFile({
        ...dailyRotateFileConfig,
        filename: 'debug-%DATE%.log',
        level: 'debug',
      })
    );
  }

  // Archivo para alertas y advertencias
  transports.push(
    new winston.transports.DailyRotateFile({
      ...dailyRotateFileConfig,
      filename: 'warn-%DATE%.log',
      level: 'warn',
    })
  );
}

// Crear logger
export const logger = winston.createLogger({
  level: logLevel,
  levels: winston.config.npm.levels,
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test', // Silenciar logs durante pruebas
});

// Método para logs de cache (con un nivel específico)
logger.logCacheOperation = (operation, key, success) => {
  logger.debug(`Cache ${operation}`, { key, success });
};

// Método para logs de rendimiento
logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info(`Performance: ${operation} completed in ${duration}ms`, {
    ...metadata,
    duration,
    timestamp: new Date().toISOString(),
  });
};

// Método para logs de seguridad
logger.logSecurity = (event, metadata = {}) => {
  logger.warn(`Security: ${event}`, {
    ...metadata,
    timestamp: new Date().toISOString(),
  });
};

// Método para logs de auditoría
logger.logAudit = (action, user, metadata = {}) => {
  logger.info(`Audit: ${action}`, {
    ...metadata,
    userId: user?.id || 'anonymous',
    username: user?.username || 'anonymous',
    timestamp: new Date().toISOString(),
  });
};

// Método para logs de base de datos
logger.logDatabase = (operation, duration, metadata = {}) => {
  logger.debug(`Database: ${operation}`, {
    ...metadata,
    duration,
    timestamp: new Date().toISOString(),
  });
};

// En caso de que Winston no capture un error no manejado
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  if (config.env === 'production') {
    process.exit(1); // Salir en producción para que el servicio se reinicie
  }
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { 
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : 'No stack trace' 
  });
});

export default logger;