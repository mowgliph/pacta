/**
 * Rate limiting middleware configuration for different API routes
 */
import rateLimit from 'express-rate-limit';

// Default API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More strict limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lenient limiter for public routes
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for sensitive operations
export const sensitiveOpLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many sensitive operations from this IP, please try again after 24 hours',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Example usage:
/*
router.use('/api', apiLimiter);
router.use('/auth', authLimiter);
router.use('/upload', uploadLimiter);
*/
