import { BaseController } from './BaseController.js';
import { ValidationService } from '../services/ValidationService.js';
import { UnauthorizedError } from '../utils/errors.js';
import AuthService from '../services/AuthService.js';
import prisma from '../database/prisma.js';
import bcrypt from 'bcrypt';

class AuthController extends BaseController {
  constructor() {
    super(AuthService);
    this.authService = AuthService;
    this.validationService = new ValidationService();
  }

  login = async (req, res, next) => {
    try {
      const validatedData = await this.validationService.validateLogin(req.body);
      const result = await this.authService.login(validatedData);
      
      // Actualizar con información IP y user agent
      await prisma.activity.create({
        data: {
          action: 'LOGIN',
          description: 'Inicio de sesión exitoso',
          userId: result.user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const token = req.body.refreshToken || req.cookies.refreshToken;
      const result = await this.authService.refreshToken(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  verifyToken = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await this.authService.verifyToken(token);
      
      // Registrar actividad
      await prisma.activity.create({
        data: {
          action: 'VERIFY_TOKEN',
          description: 'Verificación de token exitosa',
          userId: result.user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cambia la contraseña del usuario autenticado
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
      }
      
      // Obtener el usuario
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
      }
      
      // Verificar la contraseña actual
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'La contraseña actual es incorrecta' 
        });
      }
      
      // Cifrar la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Actualizar la contraseña
      await prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      });
      
      // Registrar el evento
      await prisma.activity.create({
        data: {
          action: 'change_password',
          description: 'Contraseña actualizada',
          userId: userId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Contraseña actualizada correctamente' 
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al cambiar la contraseña' 
      });
    }
  }
}

export default new AuthController();
