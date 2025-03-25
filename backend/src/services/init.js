/**
 * Inicialización de servicios del backend
 * Este archivo se importa automáticamente en index.js
 */
import { logger } from '../utils/logger.js';
import config from '../config/app.config.js';
import CacheService from './CacheService.js';
import SchedulerService from './SchedulerService.js';

// Inicializar servicios
(async () => {
  try {
    logger.info('Inicializando servicios...');
    
    // Iniciar limpieza periódica de cache
    CacheService.initCleanupTask();
    
    // Iniciar tareas programadas
    SchedulerService.init();
    
    // Configurar backup si está habilitado
    if (config.backups?.enabled) {
      const frequency = config.backups?.frequency || 'daily';
      SchedulerService.scheduleBackup(frequency);
    }
    
    logger.info('Servicios inicializados correctamente');
  } catch (error) {
    logger.error('Error al inicializar servicios', { error: error.message });
  }
})(); 