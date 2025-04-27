import { app } from 'electron';
import winston from 'winston';
import path from 'path';
import { isDevelopment } from './constants';

const LOG_FILE = path.join(app.getPath('userData'), 'logs/app.log');

// Configurar el logger
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Escribir en archivo
    new winston.transports.File({
      filename: LOG_FILE,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Escribir en consola en desarrollo
    ...(isDevelopment ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Manejar errores del logger
logger.on('error', (error) => {
  console.error('Error en el logger:', error);
});

// Función para limpiar logs antiguos
export const cleanOldLogs = async () => {
  try {
    const logDir = path.dirname(LOG_FILE);
    // Implementar limpieza de logs antiguos aquí
  } catch (error) {
    console.error('Error limpiando logs antiguos:', error);
  }
};

export { logger }; 