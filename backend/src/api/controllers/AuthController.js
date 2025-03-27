import { BaseController } from './BaseController.js';
import { ValidationService } from '../../services/ValidationService.js';
import { UnauthorizedError } from '../../utils/errors.js';
import { generateTokens, refreshToken as refresh } from '../middleware/authMiddleware.js';
import { compareSync, hashSync } from 'bcrypt';
import { prisma } from '../../database/prisma.js';

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
        const user = await prisma.user.findUnique({ where: { email: validatedData.email } });

        if (!user || !compareSync(validatedData.password, user.password)) {
          throw new UnauthorizedError('Credenciales inválidas');
        }

        const tokens = await generateTokens(user);
        return { user, ...tokens };
      },
      { email: req.body.email }
    );
  };

  register = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const validatedData = await this.validationService.validateRegistration(req.body);
        validatedData.password = hashSync(validatedData.password, 10);
        
        const user = await prisma.user.create({ data: validatedData });
        const tokens = await generateTokens(user);
        
        return { user, ...tokens };
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
}
