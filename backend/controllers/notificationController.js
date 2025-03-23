import { Notification, User, Contract } from '../models/associations.js';
import { Op } from 'sequelize';

// Obtener todas las notificaciones del usuario actual
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.findAll({
      where: { userId },
      include: [
        {
          model: Contract,
          attributes: ['id', 'title', 'contractNumber', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ 
      message: 'Error al obtener notificaciones', 
      error: error.message 
    });
  }
};

// Marcar una notificación como leída
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      where: { 
        id,
        userId
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    
    await notification.update({ read: true });
    
    res.status(200).json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ 
      message: 'Error al marcar notificación como leída', 
      error: error.message 
    });
  }
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.update(
      { read: true },
      { where: { userId, read: false } }
    );
    
    res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({ 
      message: 'Error al marcar todas las notificaciones como leídas', 
      error: error.message 
    });
  }
};

// Eliminar una notificación
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOne({
      where: { 
        id,
        userId
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    
    await notification.destroy();
    
    res.status(200).json({ message: 'Notificación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ 
      message: 'Error al eliminar notificación', 
      error: error.message 
    });
  }
};

// Obtener conteo de notificaciones no leídas
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.count({
      where: { 
        userId,
        read: false
      }
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error al obtener conteo de notificaciones no leídas:', error);
    res.status(500).json({ 
      message: 'Error al obtener conteo de notificaciones no leídas', 
      error: error.message 
    });
  }
}; 