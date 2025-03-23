// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Estados de contrato
export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  TERMINATED: 'terminated',
  RENEWED: 'renewed'
};

// Tipos de entidades para logs
export const ENTITY_TYPES = {
  CONTRACT: 'Contract',
  USER: 'User',
  LICENSE: 'License',
  NOTIFICATION: 'Notification',
  CONTRACT_DOCUMENT: 'Contract_Document'
};

// Acciones para logs
export const ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  UPDATE_STATUS: 'UPDATE_STATUS'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  UPLOAD_DIR: 'uploads'
};

// Configuración de JWT
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d'
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DEFAULT_NOTIFICATION_DAYS: 30,
  MAX_NOTIFICATION_DAYS: 90
};

// Configuración de caché
export const CACHE_CONFIG = {
  TTL: 60 * 60, // 1 hora
  MAX_ITEMS: 100
}; 