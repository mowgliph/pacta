import { config } from './config';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

// Asegurar que el directorio de logs exista
const logDir = config.logs.path;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Obtener fecha actual formateada
function getFormattedDate() {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

// Crear streams para los logs
const errorLogPath = path.join(logDir, `error-${getFormattedDate()}.log`);
const combinedLogPath = path.join(logDir, `combined-${getFormattedDate()}.log`);

// Crear los streams de archivo
const errorLogStream = fs.createWriteStream(errorLogPath, { flags: 'a' });
const combinedLogStream = fs.createWriteStream(combinedLogPath, { flags: 'a' });

// Niveles de log
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  log: 3,
  debug: 4
};

// Nivel configurado
const configuredLevel = LOG_LEVELS[config.logs.level as keyof typeof LOG_LEVELS] || LOG_LEVELS.info;

// Formatear mensaje de log
function formatLogMessage(level: string, message: string, ...args: any[]) {
  const timestamp = new Date().toISOString();
  const formattedArgs = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : arg
  ).join(' ');
  
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedArgs}`;
}

// Escribir en consola y archivo
function writeLog(level: string, message: string, ...args: any[]) {
  const logLevel = LOG_LEVELS[level as keyof typeof LOG_LEVELS] || LOG_LEVELS.info;
  
  // Si el nivel es mayor que el configurado, no registrar
  if (logLevel > configuredLevel) return;
  
  const formattedMessage = formatLogMessage(level, message, ...args);
  
  // Escribir en consola - corregimos el error de TypeScript aquí
  switch (level) {
    case 'error':
      console.error(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'info':
      console.info(formattedMessage);
      break;
    case 'debug':
      console.debug(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
  
  // Escribir en archivo
  combinedLogStream.write(formattedMessage + '\n');
  
  // Errores también se escriben en el log de errores
  if (level === 'error' || level === 'warn') {
    errorLogStream.write(formattedMessage + '\n');
  }
}

// Exportar logger
export const logger = {
  error: (message: string, ...args: any[]) => writeLog('error', message, ...args),
  warn: (message: string, ...args: any[]) => writeLog('warn', message, ...args),
  info: (message: string, ...args: any[]) => writeLog('info', message, ...args),
  log: (message: string, ...args: any[]) => writeLog('log', message, ...args),
  debug: (message: string, ...args: any[]) => writeLog('debug', message, ...args),
  
  // Método para cerrar los streams
  close: () => {
    errorLogStream.end();
    combinedLogStream.end();
  }
};

// Cerrar los streams cuando la aplicación se cierra
app.on('will-quit', () => {
  logger.info('Cerrando logger...');
  logger.close();
});