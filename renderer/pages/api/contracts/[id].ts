import { NextApiRequest, NextApiResponse } from 'next';
import { contractsApi } from '../../../api/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID de contrato inválido' });
  }

  try {
    // GET - Obtener contrato por ID
    if (req.method === 'GET') {
      const { includeDocuments } = req.query;
      const contract = await contractsApi.getContractById(
        id, 
        includeDocuments === 'true'
      );
      
      if (!contract) {
        return res.status(404).json({ error: 'Contrato no encontrado' });
      }
      
      return res.status(200).json(contract);
    } 
    // PUT - Actualizar contrato
    else if (req.method === 'PUT') {
      const updateData = req.body;
      const userId = req.headers['user-id'] as string; // Asumiendo que se pasa el ID del usuario en los headers
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      
      updateData.updatedById = userId;
      
      const updatedContract = await contractsApi.updateContract(id, updateData);
      return res.status(200).json(updatedContract);
    } 
    // DELETE - Eliminar contrato
    else if (req.method === 'DELETE') {
      const userId = req.headers['user-id'] as string;
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      
      await contractsApi.deleteContract(id, userId);
      return res.status(204).end();
    }
    
    // Método no permitido
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error(`Error en operación de contrato ${id}:`, error);
    
    // Manejo de error de validación
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Datos de contrato inválidos', 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error procesando la solicitud'
    });
  }
} 