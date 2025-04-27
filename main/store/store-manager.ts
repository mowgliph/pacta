import Store from 'electron-store';
import { app } from 'electron';
import path from 'path';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

interface StoreSchema {
  settings: {
    theme: 'light' | 'dark';
    notificationsEnabled: boolean;
    notificationDays: number;
  };
  auth: {
    token?: string;
    userId?: string;
    expiresAt?: string;
  };
}

// Store principal para la aplicación
const appStore = new Store<StoreSchema>({
  name: 'app-store',
  // Opciones adicionales de seguridad
  encryptionKey: process.env.STORE_ENCRYPTION_KEY || 'pacta-secure-key',
  clearInvalidConfig: true
});

// Inicializar valores por defecto si no existen
if (!appStore.has('settings')) {
  appStore.set('settings', {
    theme: 'light',
    notificationsEnabled: true,
    notificationDays: 7
  });
  logger.info('Configuración por defecto inicializada');
}

/**
 * Obtiene la configuración de tema
 */
export function getTheme(): 'light' | 'dark' {
  return appStore.get('settings.theme', 'light');
}

/**
 * Establece la configuración de tema
 */
export function setTheme(theme: 'light' | 'dark'): void {
  appStore.set('settings.theme', theme);
  logger.info(`Tema cambiado a: ${theme}`);
}

/**
 * Obtiene si las notificaciones están habilitadas
 */
export function getNotificationsEnabled(): boolean {
  return appStore.get('settings.notificationsEnabled', true);
}

/**
 * Establece si las notificaciones están habilitadas
 */
export function setNotificationsEnabled(enabled: boolean): void {
  appStore.set('settings.notificationsEnabled', enabled);
}

/**
 * Obtiene el número de días para mostrar notificaciones de contratos por vencer
 */
export function getNotificationDays(): number {
  return appStore.get('settings.notificationDays', 7);
}

/**
 * Establece el número de días para mostrar notificaciones de contratos por vencer
 */
export function setNotificationDays(days: number): void {
  appStore.set('settings.notificationDays', days);
}

/**
 * Obtiene el token de autenticación almacenado
 */
export function getAuthToken(): string | null {
  const token = appStore.get('auth.token');
  
  if (!token || typeof token !== 'string') {
    return null;
  }
  
  // Verificar si el token ha expirado según la fecha almacenada
  const expiresAt = appStore.get('auth.expiresAt');
  if (expiresAt && typeof expiresAt === 'string') {
    try {
      const expiryDate = new Date(expiresAt);
      if (expiryDate < new Date()) {
        logger.info('Token expirado según fecha almacenada, limpiando');
        clearAuth();
        return null;
      }
    } catch (error) {
      logger.error('Error al parsear fecha de expiración del token:', error);
      return token;
    }
  }

  return token;
}

/**
 * Establece el token de autenticación
 */
export function setAuthToken(token: string): void {
  try {
    // Decodificar el token para obtener información (sin verificar firma)
    const decoded = jwt.decode(token) as { exp?: number, id?: string };
    
    // Extraer fecha de expiración y ID de usuario
    let expiresAt: string | undefined = undefined;
    
    if (decoded?.exp && typeof decoded.exp === 'number') {
      try {
        expiresAt = new Date(decoded.exp * 1000).toISOString();
      } catch (error) {
        logger.error('Error al convertir exp a fecha:', error);
      }
    }
    
    const userId = decoded?.id && typeof decoded.id === 'string' ? decoded.id : undefined;
    
    // Guardar información en el store
    appStore.set('auth', { 
      token,
      userId,
      expiresAt
    });
    
    logger.info('Token de autenticación almacenado correctamente');
    
    if (expiresAt && typeof expiresAt === 'string') {
      try {
        const expiryTime = new Date(expiresAt);
        const timeToExpiry = expiryTime.getTime() - Date.now();
        const hoursToExpiry = Math.round(timeToExpiry / (1000 * 60 * 60));
        logger.info(`Token válido por aproximadamente ${hoursToExpiry} horas`);
      } catch (error) {
        logger.error('Error al calcular tiempo de expiración del token:', error);
      }
    }
  } catch (error) {
    logger.error('Error al almacenar token de autenticación:', error);
  }
}

/**
 * Obtiene el ID del usuario autenticado
 */
export function getAuthUserId(): string | null {
  const userId = appStore.get('auth.userId');
  return userId && typeof userId === 'string' ? userId : null;
}

/**
 * Limpia la información de autenticación
 */
export function clearAuth(): void {
  appStore.delete('auth');
  logger.info('Información de autenticación eliminada');
}

/**
 * Limpia toda la configuración almacenada
 */
export function clearStore(): void {
  appStore.clear();
  logger.info('Configuración completa eliminada');
} 