/**
 * Inicialización de servicios del backend
 * Este archivo se importa automáticamente en index.js
 */
import { logger } from '../utils/logger.js';
import config from '../config/app.config.js';
import CacheService from './CacheService.js';
import SchedulerService from './SchedulerService.js';
import seedSystemUsers from '../database/seeders/systemUsers.js'; // Importar el seeder

// Inicializar servicios
(async () => {
  try {
    logger.info('Inicializando servicios...');

    // Inicializar usuarios del sistema
    await seedSystemUsers();
    logger.info('Usuarios del sistema verificados/inicializados');

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
    logger.error('Error fatal durante la inicialización de servicios', { error: error.message });
    process.exit(1); // Terminar el proceso si hay error en la inicialización
  }
})();
