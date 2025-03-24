import NodeCache from 'node-cache';
import { AppError } from '../../utils/errors.js';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = cache.get(key);
      if (cachedResponse) {
        return res.json(cachedResponse);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function (data) {
        cache.set(key, data, duration);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      next(new AppError('Cache error occurred', 500));
    }
  };
};

// Example usage:
/*
router.get('/users', cacheMiddleware(600), userController.list); // Cache for 10 minutes
router.get('/contracts', cacheMiddleware(300), contractController.list); // Cache for 5 minutes
*/
