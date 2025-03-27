/**
 * Rutas para la gestión de backups
 */
import { BaseRoute } from './BaseRoute.js';
import { BackupController } from '../controllers/BackupController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizationMiddleware.js';
import { sensitiveRouteLimiter } from '../middleware/rateLimit.js';
import { ValidationService } from '../../services/ValidationService.js';

class BackupRoutes extends BaseRoute {
  constructor() {
    super(new BackupController());
    this.validationService = new ValidationService();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Lista de backups
    this.registerRoute('get', '/backups', this.controller.listBackups, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        this.validationService.validate('backup.backupQuerySchema', 'query')
      ]
    });

    // Detalles de backup
    this.registerRoute('get', '/backups/:id', this.controller.getBackupDetails, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        this.validationService.validate('backup.backupIdSchema', 'params')
      ]
    });

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
        this.validationService.validateAll({
          params: 'backup.backupIdSchema',
          body: 'backup.restoreBackupSchema'
        })
      ]
    });

    // Exportar backup
    this.registerRoute('post', '/backups/:id/export', this.controller.exportBackup, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        sensitiveRouteLimiter,
        this.validationService.validateAll({
          params: 'backup.backupIdSchema',
          body: 'backup.exportBackupSchema'
        })
      ]
    });

    // Estadísticas de backup
    this.registerRoute('get', '/backups/stats', this.controller.getBackupStats, {
      middlewares: [
        authenticate,
        authorize('ADMIN'),
        this.validationService.validate('backup.backupStatsSchema', 'query')
      ]
    });
  }
}

export default new BackupRoutes().getRouter();