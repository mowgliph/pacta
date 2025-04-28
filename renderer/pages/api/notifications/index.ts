import { NextApiRequest, NextApiResponse } from 'next';
import { notificationsApi } from '../../../api/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  try {
    // GET - Obtener notificaciones del usuario
    if (req.method === 'GET') {
      const { read, page = '1', limit = '20' } = req.query;
      
      // Construir filtros
      const filters: Record<string, any> = {
        userId,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };
      
      // Filtrar por estado de lectura si se especifica
      if (read !== undefined) {
        filters.read = read === 'true';
      }
      
      const notifications = await notificationsApi.getUserNotifications(filters);
      return res.status(200).json(notifications);
    } 
    // POST - Crear una nueva notificación
    else if (req.method === 'POST') {
      const notificationData = req.body;
      notificationData.createdById = userId;
      
      const notification = await notificationsApi.createNotification(notificationData);
      return res.status(201).json(notification);
    } 
    // PUT - Marcar todas las notificaciones como leídas
    else if (req.method === 'PUT') {
      await notificationsApi.markAllAsRead(userId);
      return res.status(200).json({ success: true });
    }
    
    // Método HTTP no permitido
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('Error en API de notificaciones:', error);
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error procesando la solicitud'
    });
  }
} 