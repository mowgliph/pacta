import { EventManager } from '../events/event-manager';
import { IPC_CHANNELS } from '../channels/ipc-channels';
import { IpcHandlerMap } from '../channels/types';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '8h';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export function registerAuthHandlers(eventManager: EventManager): void {
  const handlers: IpcHandlerMap = {
    [IPC_CHANNELS.AUTH.LOGIN]: async (event, credentials) => {
      logger.info('Intento de inicio de sesión', { email: credentials?.email });
      try {
        const { email, password } = LoginSchema.parse(credentials);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) throw new Error('Usuario o contraseña incorrectos');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Usuario o contraseña incorrectos');
        const token = jwt.sign(
          { id: user.id, email: user.email, roleId: user.roleId },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
        // Opcional: actualizar lastLogin
        await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
        logger.info('Login exitoso', { userId: user.id });
        return { token, user: { id: user.id, name: user.name, email: user.email, roleId: user.roleId } };
      } catch (error) {
        logger.error('Error en login:', error);
        throw new Error('Credenciales inválidas');
      }
    },

    [IPC_CHANNELS.AUTH.LOGOUT]: async (event, userId) => {
      logger.info('Cierre de sesión solicitado', { userId });
      try {
        // Registrar evento de auditoría
        await prisma.historyRecord.create({
          data: {
            entityType: 'user',
            entityId: userId,
            userId,
            action: 'logout',
            details: 'Cierre de sesión',
            timestamp: new Date(),
          }
        });
        return true;
      } catch (error) {
        logger.error('Error al registrar logout:', error);
        throw error;
      }
    },

    [IPC_CHANNELS.AUTH.VERIFY]: async (event, token) => {
      logger.info('Verificación de token solicitada');
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        return { valid: true, payload };
      } catch (error) {
        logger.warn('Token inválido:', error);
        return { valid: false };
      }
    },

    [IPC_CHANNELS.AUTH.REFRESH]: async (event, refreshToken) => {
      logger.info('Refresco de token solicitado');
      try {
        const payload = jwt.verify(refreshToken, JWT_SECRET);
        if (typeof payload !== 'object' || !payload || !('id' in payload) || !('email' in payload) || !('roleId' in payload)) {
          throw new Error('Refresh token inválido');
        }
        // Generar nuevo token
        const newToken = jwt.sign(
          { id: (payload as any).id, email: (payload as any).email, roleId: (payload as any).roleId },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );
        return { token: newToken };
      } catch (error) {
        logger.warn('Refresh token inválido:', error);
        throw new Error('Refresh token inválido');
      }
    }
  };

  eventManager.registerHandlers(handlers);
} 