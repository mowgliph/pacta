import * as dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { app } from 'electron';

// Cargar variables de entorno
dotenv.config();

// Ubicaciones de directorios de la aplicación
const appDataPath = app.getPath('userData');
const documentsDir = path.join(appDataPath, 'documents');
const tempDir = path.join(appDataPath, 'temp');
const logsDir = path.join(appDataPath, 'logs');

// Generar o recuperar una clave secreta estable para la aplicación
function getOrCreateSecretKey(): string {
  const keyPath = path.join(appDataPath, '.secret-key');
  
  try {
    // Intentar leer una clave existente
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8');
    }
    
    // Crear una nueva clave si no existe
    const newKey = crypto.randomBytes(32).toString('hex');
    
    // Asegurar que el directorio existe
    fs.mkdirSync(path.dirname(keyPath), { recursive: true });
    
    // Guardar la clave con permisos restrictivos
    fs.writeFileSync(keyPath, newKey, { mode: 0o600 }); // Solo lectura/escritura para el propietario
    return newKey;
  } catch (error) {
    console.error('Error accessing secret key:', error);
    // Si hay un error, generar una clave temporal (menos seguro, pero funcional)
    return process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
  }
}

// Configuración de la aplicación
export const config = {
  // Configuración de JWT
  jwtSecret: process.env.JWT_SECRET || getOrCreateSecretKey(),
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  
  // Configuración de base de datos - solo usado para conexión en desarrollo
  database: {
    url: process.env.DATABASE_URL
  },
  
  // Configuración de almacenamiento
  storage: {
    documentsPath: process.env.DOCUMENTS_PATH || documentsDir,
    tempPath: process.env.TEMP_PATH || tempDir,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10') * 1024 * 1024, // 10MB por defecto
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document').split(',')
  },
  
  // Configuración de email (si se implementa)
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@pacta-app.com'
  },
  
  // Configuración de logs
  logs: {
    path: process.env.LOGS_PATH || logsDir,
    level: process.env.LOG_LEVEL || 'info'
  },
  
  // Configuración general
  app: {
    name: 'PACTA',
    version: app.getVersion(),
    environment: process.env.NODE_ENV || 'production',
    port: parseInt(process.env.PORT || '3001')
  }
};