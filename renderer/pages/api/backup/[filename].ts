import { NextApiRequest, NextApiResponse } from 'next';
import { backupApi } from '../../../api/backup';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;
  const userId = req.headers['user-id'] as string;
  const userRole = req.headers['user-role'] as string;
  
  // Verificar que sea un administrador
  if (!userId || userRole !== 'admin') {
    return res.status(403).json({ error: 'No tiene permisos para gestionar backups' });
  }
  
  if (!filename || Array.isArray(filename)) {
    return res.status(400).json({ error: 'Nombre de archivo inválido' });
  }

  try {
    // PUT - Restaurar un backup específico
    if (req.method === 'PUT') {
      // Confirmar la restauración con un flag en el body
      const { confirm } = req.body;
      
      if (!confirm) {
        return res.status(400).json({ 
          error: 'Debe confirmar la restauración',
          message: 'Esta acción sobrescribirá todos los datos actuales'
        });
      }
      
      const result = await backupApi.restoreBackup(filename, userId);
      return res.status(200).json({
        success: true,
        message: 'Base de datos restaurada correctamente',
        details: result
      });
    } 
    // DELETE - Eliminar un backup específico
    else if (req.method === 'DELETE') {
      await backupApi.deleteBackup(filename, userId);
      return res.status(204).end();
    }
    
    // Método HTTP no permitido
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error(`Error en operación de backup ${filename}:`, error);
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error procesando la solicitud'
    });
  }
} 