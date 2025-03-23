import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/app.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { format, createLogger, transports } = winston;

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const errorLogFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

export class LoggingService {
  static logger = createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'pacta-service' },
    transports: [
      new transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: errorLogFormat
      }),
      new transports.File({
        filename: path.join(__dirname, '../../logs/combined.log')
      })
    ]
  });

  static stream = {
    write: (message) => {
      LoggingService.logger.info(message.trim());
    }
  };

  // Add console transport in development
  if (process.env.NODE_ENV !== 'production') {
    LoggingService.logger.add(new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }));
  }

  static info(message, meta = {}) {
    LoggingService.logger.info(message, meta);
  }

  static error(message, meta = {}) {
    LoggingService.logger.error(message, meta);
  }

  static warn(message, meta = {}) {
    LoggingService.logger.warn(message, meta);
  }

  static debug(message, meta = {}) {
    LoggingService.logger.debug(message, meta);
  }

  static logRequest(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      LoggingService.logger.info('Request completed', {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
    });
    next();
  }

  static logError(error, req = null) {
    const errorLog = {
      message: error.message,
      stack: error.stack,
      code: error.code,
      timestamp: new Date().toISOString()
    };

    if (req) {
      errorLog.request = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.body,
        query: req.query,
        params: req.params
      };
    }

    LoggingService.logger.error('Error occurred', errorLog);
  }

  static logDatabaseQuery(query, duration) {
    LoggingService.logger.debug('Database query executed', {
      query,
      duration: `${duration}ms`
    });
  }

  static logAuthentication(userId, success, ip) {
    LoggingService.logger.info('Authentication attempt', {
      userId,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  }

  static logAuthorization(userId, action, resource, success) {
    LoggingService.logger.info('Authorization check', {
      userId,
      action,
      resource,
      success,
      timestamp: new Date().toISOString()
    });
  }

  static logFileOperation(operation, file, userId) {
    LoggingService.logger.info('File operation', {
      operation,
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      userId,
      timestamp: new Date().toISOString()
    });
  }

  static logCacheOperation(operation, key, hit) {
    LoggingService.logger.debug('Cache operation', {
      operation,
      key,
      hit,
      timestamp: new Date().toISOString()
    });
  }

  static logExternalServiceCall(service, operation, duration, success) {
    LoggingService.logger.info('External service call', {
      service,
      operation,
      duration: `${duration}ms`,
      success,
      timestamp: new Date().toISOString()
    });
  }
} 