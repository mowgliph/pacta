import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors.js';
import { LoggingService } from '../services/LoggingService.js';

const prisma = new PrismaClient();
const logger = new LoggingService('CacheMiddleware');

// Middleware de caché
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const key = `cache:${req.originalUrl || req.url}`;
      const now = Date.now();

      // Limpiar caché expirado
      await prisma.cache.deleteMany({
        where: {
          expiry: {
            lt: now
          }
        }
      });

      // Intentar obtener del caché
      const cached = await prisma.cache.findUnique({
        where: { key }
      });
      
      if (cached && cached.expiry > now) {
        return res.json(JSON.parse(cached.value));
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = async function (data) {
        const expiry = now + (duration * 1000);
        
        await prisma.cache.upsert({
          where: { key },
          update: {
            value: JSON.stringify(data),
            expiry
          },
          create: {
            key,
            value: JSON.stringify(data),
            expiry
          }
        });

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache error:', error);
      next(new AppError('Cache error occurred', 500));
    }
  };
};

// Función para limpiar el caché manualmente
export const clearCache = async (pattern = null) => {
  try {
    if (pattern) {
      await prisma.cache.deleteMany({
        where: {
          key: {
            contains: pattern
          }
        }
      });
    } else {
      await prisma.cache.deleteMany();
    }
    logger.info('Cache cleared', { pattern });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    throw new AppError('Error clearing cache', 500);
  }
};

// Example usage:
/*
router.get('/users', cacheMiddleware(600), userController.list); // Cache for 10 minutes
router.get('/contracts', cacheMiddleware(300), contractController.list); // Cache for 5 minutes
router.post('/clear-cache', async (req, res) => {
  await clearCache(req.body.pattern);
  res.json({ message: 'Cache cleared' });
});
*/
