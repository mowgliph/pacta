import cron from 'node-cron';
import { differenceInDays, addDays, isAfter } from 'date-fns';
import License from '../models/License.js';
import Contract from '../models/Contract.js';
import NotificationService from './NotificationService.js';
import { User } from '../models/index.js';

class SchedulerService {
  static initializeSchedulers() {
    // Verificar licencias cada día a las 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      try {
        await this.checkLicenses();
      } catch (error) {
        console.error('Error checking licenses:', error);
      }
    });

    // Verificar contratos cada día a las 10:00 AM
    cron.schedule('0 10 * * *', async () => {
      try {
        await this.checkContracts();
      } catch (error) {
        console.error('Error checking contracts:', error);
      }
    });

    // Limpiar notificaciones antiguas cada domingo a las 3:00 AM
    cron.schedule('0 3 * * 0', async () => {
      try {
        await NotificationService.cleanupOldNotifications();
      } catch (error) {
        console.error('Error cleaning up notifications:', error);
      }
    });
  }

  static async checkLicenses() {
    try {
      const licenses = await License.findAll({
        where: { active: true },
        include: [{ model: User, as: 'user' }]
      });

      for (const license of licenses) {
        const daysUntilExpiry = differenceInDays(
          new Date(license.expiryDate),
          new Date()
        );

        // Licencia expirada
        if (daysUntilExpiry < 0) {
          await NotificationService.createLicenseNotification(
            license.userId,
            'ERROR',
            `Your license ${license.licenseKey} has expired.`,
            {
              licenseId: license.id,
              action: 'RENEW'
            }
          );
          continue;
        }

        // Notificar 30, 15, 7, 3 y 1 día antes de la expiración
        const notificationDays = [30, 15, 7, 3, 1];
        if (notificationDays.includes(daysUntilExpiry)) {
          await NotificationService.createLicenseNotification(
            license.userId,
            'WARNING',
            `Your license ${license.licenseKey} will expire in ${daysUntilExpiry} days.`,
            {
              licenseId: license.id,
              daysRemaining: daysUntilExpiry,
              action: 'RENEW'
            }
          );
        }
      }
    } catch (error) {
      console.error('Error in checkLicenses:', error);
      throw error;
    }
  }

  static async checkContracts() {
    try {
      const contracts = await Contract.findAll({
        where: { active: true },
        include: [{ model: User, as: 'user' }]
      });

      for (const contract of contracts) {
        const daysUntilExpiry = differenceInDays(
          new Date(contract.endDate),
          new Date()
        );

        // Contrato expirado
        if (daysUntilExpiry < 0) {
          await NotificationService.createContractNotification(
            contract.userId,
            contract.id,
            'ERROR',
            `Contract ${contract.contractNumber} has expired.`,
            {
              contractId: contract.id,
              action: 'RENEW'
            }
          );
          continue;
        }

        // Notificar 60, 30, 15, 7 y 3 días antes de la expiración
        const notificationDays = [60, 30, 15, 7, 3];
        if (notificationDays.includes(daysUntilExpiry)) {
          await NotificationService.createContractNotification(
            contract.userId,
            contract.id,
            'WARNING',
            `Contract ${contract.contractNumber} will expire in ${daysUntilExpiry} days.`,
            {
              contractId: contract.id,
              daysRemaining: daysUntilExpiry,
              action: 'RENEW'
            }
          );
        }

        // Verificar hitos del contrato
        if (contract.milestones) {
          for (const milestone of contract.milestones) {
            const dueDate = new Date(milestone.dueDate);
            if (!milestone.completed && isAfter(new Date(), dueDate)) {
              await NotificationService.createContractNotification(
                contract.userId,
                contract.id,
                'WARNING',
                `Milestone "${milestone.title}" for contract ${contract.contractNumber} is overdue.`,
                {
                  contractId: contract.id,
                  milestoneId: milestone.id,
                  action: 'VIEW_MILESTONE'
                }
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in checkContracts:', error);
      throw error;
    }
  }
}

export default SchedulerService;