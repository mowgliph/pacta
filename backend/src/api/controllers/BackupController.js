import { BaseController } from './BaseController.js';
import { BackupService } from '../../services/BackupService.js';
import { ExportService } from '../../services/ExportService.js';
import { NotFoundError } from '../../utils/errors.js';

export class BackupController extends BaseController {
  constructor() {
    const backupService = new BackupService();
    const exportService = new ExportService();
    super(backupService);
    this.backupService = backupService;
    this.exportService = exportService;
  }

  listBackups = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const filters = {
          ...req.query,
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 10
        };
        return await this.backupService.listBackups(filters);
      },
      { filters: req.query }
    );
  };

  getBackupDetails = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        const result = await this.backupService.getBackupDetails(id);
        if (!result) {
          throw new NotFoundError('Backup no encontrado');
        }
        return result;
      },
      { backupId: req.params.id }
    );
  };

  createBackup = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        return await this.backupService.executeBackup(req.body);
      },
      { options: req.body }
    );
  };

  restoreBackup = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        await this.backupService.restoreBackup(id, req.body.options);
        return { message: 'Backup restaurado exitosamente' };
      },
      { backupId: req.params.id, options: req.body.options }
    );
  };

  exportBackup = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { id } = req.params;
        return await this.exportService.exportBackup(id, req.body);
      },
      { backupId: req.params.id, format: req.body.format }
    );
  };
}