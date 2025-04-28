import { NextApiRequest, NextApiResponse } from 'next';
import { backupApi } from '../../../api/backup';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['user-id'] as string;
  const userRole = req.headers['user-role'] as string;
  
  // Verificar que sea un administrador
  if (!userId || userRole !== 'admin') {
    return res.status(403).json({ error: 'No tiene permisos para gestionar backups' });
  }

  try {
    // GET - Obtener lista de backups disponibles
    if (req.method === 'GET') {
      const backups = await backupApi.getBackups();
      return res.status(200).json(backups);
    } 
    // POST - Crear un nuevo backup manual
    else if (req.method === 'POST') {
      const backup = await backupApi.createBackup(userId);
      return res.status(201).json(backup);
    }
    
    // Método HTTP no permitido
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('Error en API de backup:', error);
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error procesando la solicitud'
    });
  }
} 