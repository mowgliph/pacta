import { NextApiRequest, NextApiResponse } from 'next';
import { notificationsApi } from '../../../api/notifications';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userId = req.headers['user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID de notificación inválido' });
  }

  try {
    // PATCH - Marcar una notificación como leída
    if (req.method === 'PATCH') {
      await notificationsApi.markAsRead(id, userId);
      return res.status(200).json({ success: true });
    } 
    // DELETE - Eliminar una notificación
    else if (req.method === 'DELETE') {
      await notificationsApi.deleteNotification(id, userId);
      return res.status(204).end();
    }
    
    // Método HTTP no permitido
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error(`Error en operación de notificación ${id}:`, error);
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error procesando la solicitud'
    });
  }
} 