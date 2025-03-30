import { BaseController } from './BaseController.js';
import { ValidationService } from '../../services/ValidationService.js';
import { UnauthorizedError } from '../../utils/errors.js';
import { generateTokens, refreshToken as refresh } from '../middleware/authMiddleware.js';
import { compareSync } from 'bcrypt';
import { prisma } from '../../database/prisma.js';
import jwt from 'jsonwebtoken';

export class AuthController extends BaseController {
  constructor() {
    super();
    this.validationService = new ValidationService();
  }

  login = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const validatedData = await this.validationService.validateLogin(req.body);
        
        // Buscar usuario por email
        const user = await prisma.user.findUnique({ 
          where: { email: validatedData.email } 
        });

        if (!user) {
          throw new UnauthorizedError('Credenciales inválidas');
        }

        // Verificar contraseña
        if (!compareSync(validatedData.password, user.password)) {
          throw new UnauthorizedError('Credenciales inválidas');
        }

        // Verificar que el usuario está activo
        if (user.status !== 'ACTIVE') {
          throw new UnauthorizedError('Usuario inactivo');
        }

        // Verificar que es un usuario del sistema
        if (!user.isSystemUser) {
          throw new UnauthorizedError('Acceso no autorizado');
        }

        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });

        // Generar tokens
        const tokens = await generateTokens(user);

        // Registrar actividad
        await prisma.activity.create({
          data: {
            action: 'LOGIN',
            description: 'Inicio de sesión exitoso',
            userId: user.id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }
        });

        return { 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isSystemUser: user.isSystemUser
          },
          ...tokens 
        };
      },
      { email: req.body.email }
    );
  };

  refreshToken = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const token = req.body.refreshToken || req.cookies.refreshToken;
        if (!token) {
          throw new UnauthorizedError('Token de actualización requerido');
        }
        return await refresh(token);
      },
      { tokenPresent: !!req.body.refreshToken || !!req.cookies.refreshToken }
    );
  };

  verifyToken = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
          throw new UnauthorizedError('Token no proporcionado');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar usuario
        const user = await prisma.user.findUnique({
          where: { id: decoded.id }
        });

        if (!user) {
          throw new UnauthorizedError('Usuario no encontrado');
        }

        if (user.status !== 'ACTIVE') {
          throw new UnauthorizedError('Usuario inactivo');
        }

        if (!user.isSystemUser) {
          throw new UnauthorizedError('Acceso no autorizado');
        }

        return {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isSystemUser: user.isSystemUser
          }
        };
      },
      { tokenPresent: !!req.headers.authorization }
    );
  };
}
