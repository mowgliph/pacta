/**
 * Middleware de autenticación para la API
 */
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { UnauthorizedError } from '../../utils/errors.js';
import config from '../../config/app.config.js';

/**
 * Middleware para verificar que el usuario está autenticado
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Invalid authentication token');
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);

      // Verificar que el usuario existe y está activo
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedError('User account is not active');
      }

      // Almacenar el usuario en el objeto de solicitud
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Authentication token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid authentication token');
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    return next(error);
  }
};

/**
 * Genera tokens de acceso y refresco para un usuario
 * @param {Object} user - Usuario autenticado
 * @returns {Object} - Tokens generados
 */
export const generateTokens = user => {
  // Datos a incluir en el token
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Generar token de acceso (corta duración)
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpiry || '15m',
  });

  // Generar token de refresco (larga duración)
  const refreshToken = jwt.sign({ id: user.id }, config.jwt.refreshSecret || config.jwt.secret, {
    expiresIn: config.jwt.refreshTokenExpiry || '7d',
  });

  // Guardar el token de refresco en la base de datos
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días por defecto

  prisma.refreshToken
    .create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    })
    .catch(error => {
      logger.error('Error saving refresh token', { userId: user.id, error: error.message });
    });

  return { accessToken, refreshToken };
};

/**
 * Refresca el token de acceso utilizando un token de refresco
 * @param {String} refreshToken - Token de refresco
 * @returns {Promise<Object>} - Nuevos tokens
 */
export const refreshToken = async refreshToken => {
  try {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    // Verificar que el token existe en la base de datos
    const tokenData = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenData) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Verificar que el token no ha expirado
    if (new Date() > new Date(tokenData.expiresAt)) {
      // Eliminar token expirado
      await prisma.refreshToken.delete({
        where: { id: tokenData.id },
      });

      throw new UnauthorizedError('Refresh token has expired');
    }

    // Verificar la firma del token
    try {
      jwt.verify(refreshToken, config.jwt.refreshSecret || config.jwt.secret);
    } catch (error) {
      // Eliminar token inválido
      await prisma.refreshToken.delete({
        where: { id: tokenData.id },
      });

      throw new UnauthorizedError('Invalid refresh token');
    }

    // Generar nuevos tokens
    const tokens = generateTokens(tokenData.user);

    // Eliminar el token de refresco antiguo
    await prisma.refreshToken.delete({
      where: { id: tokenData.id },
    });

    return tokens;
  } catch (error) {
    logger.error('Error refreshing token', { error: error.message });
    throw error;
  }
};
