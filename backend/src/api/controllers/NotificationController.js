import NotificationService from '../services/NotificationService.js';

class NotificationController {
  async getNotifications(req, res) {
    try {
      const { limit, offset, group, unreadOnly } = req.query;
      const userId = req.user.id;

      const notifications = await NotificationService.getNotifications(userId, {
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        group,
        unreadOnly: unreadOnly === 'true'
      });

      res.json(notifications);
    } catch (error) {
      console.error('Error in getNotifications:', error);
      res.status(500).json({
        message: 'Error fetching notifications',
        error: error.message
      });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const { group } = req.query;

      const count = await NotificationService.getUnreadCount(userId, group);

      res.json({ count });
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      res.status(500).json({
        message: 'Error getting unread count',
        error: error.message
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const notification = await NotificationService.markAsRead(id, userId);

      res.json(notification);
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({
        message: 'Error marking notification as read',
        error: error.message
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { group } = req.query;

      await NotificationService.markAllAsRead(userId, group);

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      res.status(500).json({
        message: 'Error marking all notifications as read',
        error: error.message
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await NotificationService.deleteNotification(id, userId);

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      res.status(500).json({
        message: 'Error deleting notification',
        error: error.message
      });
    }
  }

  // Endpoint para limpiar notificaciones antiguas (solo admin)
  async cleanupOldNotifications(req, res) {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          message: 'Unauthorized: Admin access required'
        });
      }

      const { days } = req.query;
      await NotificationService.cleanupOldNotifications(parseInt(days) || 30);

      res.json({ message: 'Old notifications cleaned up successfully' });
    } catch (error) {
      console.error('Error in cleanupOldNotifications:', error);
      res.status(500).json({
        message: 'Error cleaning up old notifications',
        error: error.message
      });
    }
  }
}

export default new NotificationController(); 