import { NextApiRequest, NextApiResponse } from 'next';
import { contractsApi } from '../../../api/contracts';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Extraer parámetros de consulta
      const { page = '1', limit = '10', type, status, search } = req.query;
      
      // Construir filtros para la consulta
      const filters: Record<string, any> = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };
      
      if (type) filters.type = type;
      if (status) filters.status = status;
      if (search) filters.search = search;
      
      // Obtener contratos usando el API de contratos
      const result = await contractsApi.getContracts(filters);
      
      return res.status(200).json(result);
    } else if (req.method === 'POST') {
      // Crear un nuevo contrato
      const contractData = req.body;
      const newContract = await contractsApi.createContract(contractData);
      
      return res.status(201).json(newContract);
    }
    
    // Método HTTP no permitido
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('Error en API de contratos:', error);
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error procesando la solicitud'
    });
  }
}

export default handler; 