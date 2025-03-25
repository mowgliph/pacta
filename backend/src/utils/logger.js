import winston from 'winston';
import config from '../config/app.config.js';

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

// Agregar log a archivo si estamos en producción
if (config.env === 'production' || config.logging?.files) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Crear logger
export const logger = winston.createLogger({
  level: logLevel,
  levels: winston.config.npm.levels,
  transports,
  exitOnError: false,
});

// Método para logs de cache (con un nivel específico)
logger.logCacheOperation = (operation, key, success) => {
  logger.debug(`Cache ${operation}`, { key, success });
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