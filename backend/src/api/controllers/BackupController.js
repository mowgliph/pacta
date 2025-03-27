/**
 * Controlador para la gestión de backups
 */
import { BaseController } from './BaseController.js';
import { BackupService } from '../../services/BackupService.js';
import { ExportService } from '../../services/ExportService.js';
import { ResponseService } from '../../services/ResponseService.js';
import logger from '../../utils/logger.js';

export class BackupController extends BaseController {
  constructor() {
    super();
    this.backupService = new BackupService();
    this.exportService = new ExportService();
  }

  listBackups = async (req, res) => {
    try {
      const filters = {
        ...req.query,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };
      const result = await this.backupService.listBackups(filters);
      return ResponseService.success('Backups recuperados exitosamente', result);
    } catch (error) {
      logger.error('Error listando backups:', error);
      return ResponseService.error('Error al recuperar backups');
    }
  };

  getBackupDetails = async (req, res) => {
    try {
      const result = await this.backupService.getBackupDetails(req.params.id);
      return result
        ? ResponseService.success('Detalles del backup recuperados exitosamente', result)
        : ResponseService.notFound('Backup no encontrado');
    } catch (error) {
      logger.error('Error obteniendo detalles del backup:', error);
      return ResponseService.error('Error al obtener detalles del backup');
    }
  };

  createBackup = async (req, res) => {
    try {
      const result = await this.backupService.executeBackup(req.body);
      return ResponseService.success('Backup creado exitosamente', result);
    } catch (error) {
      logger.error('Error creando backup:', error);
      return ResponseService.error('Error al crear backup');
    }
  };

  restoreBackup = async (req, res) => {
    try {
      await this.backupService.restoreBackup(req.params.id, req.body.options);
      return ResponseService.success('Backup restaurado exitosamente');
    } catch (error) {
      logger.error('Error restaurando backup:', error);
      return ResponseService.error('Error al restaurar backup');
    }
  };

  exportBackup = async (req, res) => {
    try {
      const result = await this.exportService.exportBackup(
        req.params.id,
        req.body
      );
      return ResponseService.success('Backup exportado exitosamente', result);
    } catch (error) {
      logger.error('Error exportando backup:', error);
      return ResponseService.error('Error al exportar backup');
    }
  };

  getBackupStats = async (req, res) => {
    try {
      const stats = await this.backupService.getStats(req.query);
      return ResponseService.success('Estadísticas recuperadas exitosamente', stats);
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      return ResponseService.error('Error al obtener estadísticas');
    }
  };
}