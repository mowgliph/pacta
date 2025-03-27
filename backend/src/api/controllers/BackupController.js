/**
 * Controlador para la gestión de backups
 */
import { BaseController } from './BaseController.js';
import { BackupService } from '../../services/BackupService.js';
import { ResponseService } from '../../services/ResponseService.js';
import logger from '../../utils/logger.js';

export class BackupController extends BaseController {
  constructor() {
    super();
    this.backupService = new BackupService();
  }

  /**
   * Lista los backups disponibles
   */
  async listBackups(req, res) {
    try {
      const backups = await this.backupService.listBackups(req.query);
      return ResponseService.success('Backups retrieved successfully', backups);
    } catch (error) {
      logger.error('Error listing backups:', error);
      return ResponseService.error('Failed to retrieve backups');
    }
  }

  /**
   * Obtiene detalles de un backup específico
   */
  async getBackupDetails(req, res) {
    try {
      const backup = await this.backupService.getBackupDetails(req.params.id);
      if (!backup) {
        return ResponseService.notFound('Backup not found');
      }
      return ResponseService.success('Backup details retrieved successfully', backup);
    } catch (error) {
      logger.error('Error getting backup details:', error);
      return ResponseService.error('Failed to retrieve backup details');
    }
  }

  /**
   * Crea un nuevo backup manual
   */
  async createBackup(req, res) {
    try {
      const backup = await this.backupService.executeBackup('manual', req.body);
      return ResponseService.success('Backup created successfully', backup);
    } catch (error) {
      logger.error('Error creating backup:', error);
      return ResponseService.error('Failed to create backup');
    }
  }

  /**
   * Restaura un backup existente
   */
  async restoreBackup(req, res) {
    try {
      await this.backupService.restoreBackup(req.params.id, req.body);
      return ResponseService.success('Backup restored successfully');
    } catch (error) {
      logger.error('Error restoring backup:', error);
      return ResponseService.error('Failed to restore backup');
    }
  }

  /**
   * Obtiene información del espacio de almacenamiento
   */
  async getSpaceInfo(req, res) {
    try {
      const spaceInfo = await this.backupService.getSpaceInfo();
      return ResponseService.success('Space information retrieved successfully', spaceInfo);
    } catch (error) {
      logger.error('Error getting space info:', error);
      return ResponseService.error('Failed to retrieve space information');
    }
  }
}