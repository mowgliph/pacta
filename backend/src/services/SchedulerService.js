import schedule from 'node-schedule';
import prisma from '../database/prisma.js';
import { differenceInDays } from 'date-fns';
import NotificationService from './NotificationService.js';
import { logger } from '../utils/logger.js';
import backupService from './BackupService.js';
import purgeService from './PurgeService.js';

class SchedulerService {
  static init() {
    try {
      // Programar tareas diarias a las 9:00 AM
      schedule.scheduleJob('0 9 * * *', async () => {
        await this.checkLicenses();
      });
    } catch (error) {
      logger.error('Error checking licenses:', error);
    }
  }

  static scheduleBackup(frequency = 'daily') {
    try {
      let cronExpression;

      switch (frequency) {
        case 'hourly':
          cronExpression = '0 * * * *';
          break;
        case 'daily':
          cronExpression = '0 0 * * *'; // A la medianoche
          break;
        case 'weekly':
          cronExpression = '0 0 * * 0'; // Domingo a medianoche
          break;
        default:
          cronExpression = '0 0 * * *'; // Diario por defecto
      }

      schedule.scheduleJob(cronExpression, async () => {
        await this.runBackup();
      });

      logger.info(`Backups programados con frecuencia ${frequency}`);
    } catch (error) {
      logger.error('Error al programar backups:', error);
    }
  }

  static async checkLicenses() {
    try {
      const licenses = await prisma.license.findMany({
        where: {
          active: true,
        },
        include: {
          user: true,
        },
      });

      for (const license of licenses) {
        const daysUntilExpiry = differenceInDays(new Date(license.expiryDate), new Date());

        if (daysUntilExpiry < 0) {
          // La licencia ha expirado
          await NotificationService.createLicenseNotification(
            license.userId,
            'ERROR',
            `Your license ${license.licenseKey} has expired.`,
            {
              licenseId: license.id,
              status: 'EXPIRED',
            },
          );
        } else if (daysUntilExpiry <= 30) {
          // La licencia expirará pronto
          await NotificationService.createLicenseNotification(
            license.userId,
            'WARNING',
            `Your license ${license.licenseKey} will expire in ${daysUntilExpiry} days.`,
            {
              licenseId: license.id,
              status: 'EXPIRING_SOON',
              daysRemaining: daysUntilExpiry,
            },
          );
        }
      }
    } catch (error) {
      logger.error('Error in checkLicenses:', error);
    }
  }

  static async runBackup() {
    try {
      logger.info('Starting scheduled backup');
      await backupService.executeBackup('auto');
      logger.info('Scheduled backup completed');
    } catch (error) {
      logger.error('Scheduled backup failed:', error);
    }
  }

  /**
   * Ejecuta la limpieza programada de backups
   */
  static async runPurge() {
    try {
      logger.info('Starting scheduled purge');
      await purgeService.executePurge();
      logger.info('Scheduled purge completed');
    } catch (error) {
      logger.error('Scheduled purge failed:', error);
    }
  }

  /**
   * Inicializa las tareas programadas
   */
  static initializeScheduledTasks() {
    // Programar purga diaria
    schedule.scheduleJob('0 1 * * *', async () => {
      await this.runPurge();
    });
  }
}

export default SchedulerService;
