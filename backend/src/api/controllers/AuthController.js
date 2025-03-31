import { BaseController } from './BaseController.js';
import { ValidationService } from '../../services/ValidationService.js';
import { UnauthorizedError } from '../../utils/errors.js';
import AuthService from '../../services/AuthService.js';
import prisma from '../../database/prisma.js';

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
}

export default new AuthController();
