import { NextApiRequest, NextApiResponse } from 'next';
import { contractsApi } from '../../../../../api/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID de contrato inválido' });
  }

  try {
    // Verificar primero si el contrato existe
    const contract = await contractsApi.getContractById(id);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    
    // GET - Obtener todos los suplementos de un contrato
    if (req.method === 'GET') {
      // Asumiendo que los suplementos están incluidos en el contrato recuperado
      return res.status(200).json(contract.supplements || []);
    } 
    // POST - Crear un nuevo suplemento
    else if (req.method === 'POST') {
      const userId = req.headers['user-id'] as string;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      
      const supplementData = req.body;
      supplementData.createdById = userId;
      
      // Asumiendo que hay un método en el API de contratos para agregar suplementos
      // Este método tendría que ser implementado en el API de contratos
      const updatedContract = await contractsApi.addSupplement(id, supplementData);
      
      return res.status(201).json(updatedContract.supplements[updatedContract.supplements.length - 1]);
    }
    
    // Método no permitido
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error(`Error en operación de suplementos para contrato ${id}:`, error);
    
    // Manejo de error de validación
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Datos de suplemento inválidos', 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error procesando la solicitud'
    });
  }
} 