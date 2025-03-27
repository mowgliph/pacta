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
    // Rutas protegidas (requieren autenticación y rol admin)
    this.get(
      '/backups',
      this.controller.listBackups,
      [
        authenticate,
        authorize('ADMIN'),
        this.validationService.validate(
          this.validationService.validators.backup.backupQuerySchema,
          'query'
        )
      ]
    );

    this.get(
      '/backups/:id',
      this.controller.getBackupDetails,
      [
        authenticate,
        authorize('ADMIN'),
        this.validationService.validate(
          this.validationService.validators.backup.backupIdSchema,
          'params'
        )
      ]
    );

    this.post(
      '/backups',
      this.controller.createBackup,
      [
        authenticate,
        authorize('ADMIN'),
        sensitiveRouteLimiter,
        this.validationService.validate(
          this.validationService.validators.backup.createBackupSchema
        )
      ]
    );

    this.post(
      '/backups/:id/restore',
      this.controller.restoreBackup,
      [
        authenticate,
        authorize('ADMIN'),
        sensitiveRouteLimiter,
        this.validationService.validateAll({
          params: this.validationService.validators.backup.backupIdSchema,
          body: this.validationService.validators.backup.restoreBackupSchema
        })
      ]
    );

    this.get(
      '/backups/space',
      this.controller.getSpaceInfo,
      [
        authenticate,
        authorize('ADMIN')
      ]
    );
  }
}

export default new BackupRoutes().getRouter();