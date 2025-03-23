import { Notification, User, Contract } from '../models/index.js';
import { NOTIFICATION_CONFIG } from '../config/constants.js';
import { AppError } from '../middleware/errorHandler.js';

class NotificationService {
  static async createNotification(data) {
    try {
      const notification = await Notification.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        group: data.group,
        metadata: data.metadata || {},
        read: false,
        contractId: data.contractId
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 10, category, type, read } = options;
      const offset = (page - 1) * limit;

      const where = { userId };
      
      if (category) where.category = category;
      if (type) where.type = type;
      if (typeof read === 'boolean') where.read = read;

      const { count, rows } = await Notification.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        notifications: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        throw new AppError('Notificación no encontrada', 404);
      }

      await notification.update({
        status: 'read',
        readAt: new Date()
      });

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      await Notification.update(
        {
          status: 'read',
          readAt: new Date()
        },
        {
          where: {
            userId,
            status: 'unread'
          }
        }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId, category) {
    try {
      const where = { 
        userId,
        read: false
      };

      if (category) where.category = category;

      const count = await Notification.count({ where });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Métodos específicos para notificaciones de licencias
  static async createLicenseNotification(userId, type, message, metadata = {}) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        message,
        category: 'LICENSE',
        metadata: {
          timestamp: new Date().toISOString(),
          ...metadata
        },
        read: false
      });

      return notification;
    } catch (error) {
      console.error('Error creating license notification:', error);
      throw error;
    }
  }

  // Métodos específicos para notificaciones de contratos
  static async createContractNotification(userId, contractId, type, message, metadata = {}) {
    return this.createNotification({
      userId,
      contractId,
      type,
      title: 'Contract Notification',
      message,
      group: 'contract',
      metadata
    });
  }

  // Limpiar notificaciones antiguas
  static async cleanupOldNotifications(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const where = {
        createdAt: {
          [db.Sequelize.Op.lt]: cutoffDate
        },
        read: true
      };

      await Notification.destroy({ where });
      return true;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }

  static async createContractExpiryNotification(contractId) {
    try {
      const contract = await Contract.findByPk(contractId, {
        include: [{ model: User, attributes: ['id', 'username'] }]
      });

      if (!contract) {
        throw new AppError('Contrato no encontrado', 404);
      }

      const daysUntilExpiry = Math.ceil((contract.endDate - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= NOTIFICATION_CONFIG.DEFAULT_NOTIFICATION_DAYS) {
        const message = `El contrato ${contract.contractNumber} expirará en ${daysUntilExpiry} días`;
        
        await Notification.createNotification(
          contract.User.id,
          'contract_expiry',
          message,
          contractId
        );
      }
    } catch (error) {
      console.error('Error creating contract expiry notification:', error);
      throw error;
    }
  }

  static async createRenewalReminder(contractId) {
    try {
      const contract = await Contract.findByPk(contractId, {
        include: [{ model: User, attributes: ['id', 'username'] }]
      });

      if (!contract) {
        throw new AppError('Contrato no encontrado', 404);
      }

      const message = `El contrato ${contract.contractNumber} está próximo a renovarse`;
      
      await Notification.createNotification(
        contract.User.id,
        'renewal_reminder',
        message,
        contractId
      );
    } catch (error) {
      console.error('Error creating renewal reminder:', error);
      throw error;
    }
  }

  static async createStatusChangeNotification(contractId, oldStatus, newStatus) {
    try {
      const contract = await Contract.findByPk(contractId, {
        include: [{ model: User, attributes: ['id', 'username'] }]
      });

      if (!contract) {
        throw new AppError('Contrato no encontrado', 404);
      }

      const message = `El estado del contrato ${contract.contractNumber} ha cambiado de ${oldStatus} a ${newStatus}`;
      
      await Notification.createNotification(
        contract.User.id,
        'status_change',
        message,
        contractId
      );
    } catch (error) {
      console.error('Error creating status change notification:', error);
      throw error;
    }
  }

  static async createDocumentUpdateNotification(contractId, documentName) {
    try {
      const contract = await Contract.findByPk(contractId, {
        include: [{ model: User, attributes: ['id', 'username'] }]
      });

      if (!contract) {
        throw new AppError('Contrato no encontrado', 404);
      }

      const message = `Se ha actualizado el documento ${documentName} en el contrato ${contract.contractNumber}`;
      
      await Notification.createNotification(
        contract.User.id,
        'document_update',
        message,
        contractId
      );
    } catch (error) {
      console.error('Error creating document update notification:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId, { page = 1, limit = 10, status = null } = {}) {
    try {
      const where = { userId };
      if (status) {
        where.status = status;
      }

      const notifications = await Notification.findAndCountAll({
        where,
        include: [
          { model: Contract, attributes: ['contractNumber', 'name'] }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset: (page - 1) * limit
      });

      return {
        notifications: notifications.rows,
        total: notifications.count,
        page,
        totalPages: Math.ceil(notifications.count / limit)
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  static async archiveNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });

      if (!notification) {
        throw new AppError('Notificación no encontrada', 404);
      }

      await notification.update({
        status: 'archived'
      });

      return notification;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  static async cleanupExpiredNotifications() {
    try {
      await Notification.update(
        { status: 'archived' },
        {
          where: {
            status: { [db.Sequelize.Op.ne]: 'archived' },
            expiresAt: { [db.Sequelize.Op.lt]: new Date() }
          }
        }
      );
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      throw error;
    }
  }
}

export default NotificationService; 