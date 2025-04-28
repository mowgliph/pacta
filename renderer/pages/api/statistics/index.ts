import { NextApiRequest, NextApiResponse } from 'next';
import { statisticsApi } from '../../../api/statistics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Solo permitir método GET
    if (req.method === 'GET') {
      const { period = 'month', type } = req.query;
      
      // Obtener estadísticas generales
      const statistics = await statisticsApi.getStatistics({
        period: period as string,
        type: type as string
      });
      
      return res.status(200).json(statistics);
    }
    
    // Método HTTP no permitido
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('Error en API de estadísticas:', error);
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error procesando la solicitud'
    });
  }
} 