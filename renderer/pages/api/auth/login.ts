import { NextApiRequest, NextApiResponse } from 'next';
import { authApi } from '../../../api/auth';
import { z } from 'zod';

// Esquema de validación para la solicitud de login
const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
  rememberMe: z.boolean().optional().default(false)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo aceptar solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Validar los datos de entrada
    const validatedData = loginSchema.parse(req.body);
    
    // Intentar autenticar al usuario
    const authResult = await authApi.login(
      validatedData.username, 
      validatedData.password, 
      validatedData.rememberMe
    );
    
    // Si la autenticación es exitosa, devolver token y datos del usuario
    return res.status(200).json({
      success: true,
      user: authResult.user,
      token: authResult.token,
      expiresAt: authResult.expiresAt
    });
  } catch (error: any) {
    console.error('Error en autenticación:', error);
    
    // Manejar error de validación
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Datos de autenticación inválidos',
        details: error.errors
      });
    }
    
    // Error de autenticación (credenciales incorrectas)
    if (error.message === 'Credenciales inválidas') {
      return res.status(401).json({ 
        error: 'Usuario o contraseña incorrectos'
      });
    }
    
    // Otros errores del servidor
    return res.status(500).json({ 
      error: 'Error del servidor', 
      message: error.message || 'Ha ocurrido un error durante la autenticación'
    });
  }
} 