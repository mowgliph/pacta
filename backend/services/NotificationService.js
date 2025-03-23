import { Notification } from '../models/Notification.js';
import { Op } from 'sequelize';

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
        throw new Error('Notification not found');
      }

      notification.read = true;
      notification.readAt = new Date();
      await notification.save();

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId, category) {
    try {
      const where = { 
        userId,
        read: false
      };

      if (category) where.category = category;

      await Notification.update(
        { 
          read: true,
          readAt: new Date()
        },
        { where }
      );

      return true;
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
          [Op.lt]: cutoffDate
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
}

export default NotificationService; 