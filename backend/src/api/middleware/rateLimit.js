/**
 * Rate limiting middleware configuration for different API routes
 */
import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import config from '../../config/app.config.js';

/**
 * Middleware general para limitar solicitudes a la API
 */
export const apiLimiter = rateLimit({
  windowMs: config.security?.rateLimit?.windowMs || 15 * 60 * 1000, // 15 minutos por defecto
  max: config.security?.rateLimit?.max || 100, // Límite de 100 solicitudes por ventana
  standardHeaders: true, // Encabezados estándar de rate limit (RateLimit-*)
  legacyHeaders: false, // Desactivar encabezados X-RateLimit-*
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
    });

    next(new RateLimitError('Demasiadas solicitudes, por favor inténtelo más tarde'));
  },
  keyGenerator: req => {
    // Usar IP como clave, o preferiblemente una header X-Forwarded-For
    return req.headers['x-forwarded-for'] || req.ip;
  },
  skip: req => {
    // No aplicar límite a rutas de healthcheck o de desarrollo
    return req.path === '/health' || req.path.startsWith('/dev/');
  },
});

/**
 * Middleware más estricto para rutas de autenticación
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 intentos por hora
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
    });

    next(new RateLimitError('Demasiados intentos de acceso, por favor inténtelo más tarde'));
  },
});

/**
 * Middleware para limitar solicitudes a rutas sensibles
 */
export const sensitiveRouteLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // 5 intentos por 5 minutos
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Sensitive route rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
    });

    next(new RateLimitError('Demasiados intentos, por favor inténtelo más tarde'));
  },
});

// Example usage:
/*
router.use('/api', apiLimiter);
router.use('/auth', authLimiter);
router.use('/upload', uploadLimiter);
*/
