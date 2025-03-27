/**
 * Rutas para la gestión de backups
 */
import { BaseRoute } from './BaseRoute.js';
import { BackupController } from '../controllers/BackupController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizationMiddleware.js';
import { sensitiveRouteLimiter } from '../middleware/rateLimit.js';
import { ValidationService } from '../../services/ValidationService.js';
import { cacheMiddleware } from '../middleware/cache.js';

class BackupRoutes extends BaseRoute {
  constructor() {
    super(new BackupController());
    this.validationService = new ValidationService();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Lista de backups (cached for 5 minutes)
    this.registerRoute('get', '/backups', this.controller.listBackups, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        cacheMiddleware(300), // 5 minutes cache
        this.validationService.validate('backup.backupQuerySchema', 'query')
      ]
    });

    // Detalles de backup (cached for 10 minutes)
    this.registerRoute('get', '/backups/:id', this.controller.getBackupDetails, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        cacheMiddleware(600), // 10 minutes cache
        this.validationService.validate('backup.backupIdSchema', 'params')
      ]
    });

    // Estadísticas de backup (cached for 15 minutes)
    this.registerRoute('get', '/backups/stats', this.controller.getBackupStats, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        cacheMiddleware(900), // 15 minutes cache
        this.validationService.validate('backup.backupStatsSchema', 'query')
      ]
    });

    // Las rutas de modificación permanecen sin caché
    // Crear backup
    this.registerRoute('post', '/backups', this.controller.createBackup, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        sensitiveRouteLimiter,
        this.validationService.validate('backup.createBackupSchema', 'body')
      ]
    });

    // Restaurar backup
    this.registerRoute('post', '/backups/:id/restore', this.controller.restoreBackup, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        sensitiveRouteLimiter,
        this.validationService.validate('backup.backupIdSchema', 'params'),
        this.validationService.validate('backup.restoreBackupSchema', 'body')
      ]
    });

    // Exportar backup
    this.registerRoute('post', '/backups/:id/export', this.controller.exportBackup, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        sensitiveRouteLimiter,
        this.validationService.validate('backup.backupIdSchema', 'params'),
        this.validationService.validate('backup.exportBackupSchema', 'body')
      ]
    });
  }
}

export default new BackupRoutes().getRouter();