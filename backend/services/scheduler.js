import schedule from 'node-schedule';
import { Contract, User, Notification, ActivityLog } from '../models/associations.js';
import { Op } from 'sequelize';

const checkExpiringContracts = schedule.scheduleJob('0 9 * * *', async () => {
  try {
    const today = new Date();
    const contracts = await Contract.findAll({
      where: {
        status: {
          [Op.notIn]: ['expired', 'terminated']
        }
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username', 'email']
      }]
    });

    for (const contract of contracts) {
      if (contract.isExpiringSoon()) {
        // Create notification
        await Notification.create({
          userId: contract.createdBy,
          contractId: contract.id,
          type: 'EXPIRING_SOON',
          message: `Contract ${contract.contractNumber} will expire in ${contract.notificationDays} days`
        });

        await ActivityLog.create({
          userId: contract.createdBy,
          action: 'NOTIFICATION',
          entityType: 'Contract',
          entityId: contract.id,
          details: `Contract ${contract.contractNumber} expiration notification created`
        });
      }

      if (new Date(contract.endDate) <= today) {
        await contract.update({ status: 'expired' });
        
        await Notification.create({
          userId: contract.createdBy,
          contractId: contract.id,
          type: 'EXPIRED',
          message: `Contract ${contract.contractNumber} has expired`
        });

        await ActivityLog.create({
          userId: contract.createdBy,
          action: 'STATUS_CHANGE',
          entityType: 'Contract',
          entityId: contract.id,
          details: 'Contract status changed to expired'
        });
      }
    }
  } catch (error) {
    console.error('Error checking expiring contracts:', error);
  }
});

export default {
  checkExpiringContracts
};