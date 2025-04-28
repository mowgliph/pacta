import { NextApiRequest, NextApiResponse } from 'next';
import { usersApi } from '../../../api/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET - Obtener lista de usuarios
    if (req.method === 'GET') {
      const { page = '1', limit = '10', role, active } = req.query;
      
      // Construir filtros
      const filters: Record<string, any> = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };
      
      if (role) filters.role = role;
      if (active !== undefined) filters.active = active === 'true';
      
      const result = await usersApi.getUsers(filters);
      return res.status(200).json(result);
    } 
    // POST - Crear nuevo usuario
    else if (req.method === 'POST') {
      const userData = req.body;
      const adminId = req.headers['user-id'] as string;
      const adminRole = req.headers['user-role'] as string;
      
      // Verificar permisos administrativos
      if (!adminId || adminRole !== 'admin') {
        return res.status(403).json({ error: 'No tiene permisos para crear usuarios' });
      }
      
      const newUser = await usersApi.createUser(userData, adminId);
      return res.status(201).json(newUser);
    }
    
    // Método HTTP no permitido
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('Error en API de usuarios:', error);
    
    // Manejo de error de validación
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Datos de usuario inválidos', 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error procesando la solicitud'
    });
  }
} 