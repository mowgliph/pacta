import express from 'express';
import { cacheMiddleware } from '../middleware/cache.js';
import { validate } from '../middleware/validate.js';
import { apiLimiter } from '../middleware/rateLimit.js';
import { validateJWT } from '../middleware/authMiddleware.js';
import IndexController from '../controllers/IndexController.js';

// Import routes
import authRoutes from './auth.js';
import userRoutes from './userRoutes.js';
import contractRoutes from './contracts.js';
import companyRoutes from './companyRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import dashboardRoutes from './dashboard.js';
import analyticsRoutes from './analytics.js';
import licenseRoutes from './license.js';

const router = express.Router();
const indexController = new IndexController();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/', indexController.getApiInfo);
router.get('/health', indexController.healthCheck);

// API versioning
const apiVersion = '/v1';

// Protected routes with authentication
router.use(`${apiVersion}/auth`, authRoutes);
router.use(`${apiVersion}/users`, validateJWT, userRoutes);
router.use(`${apiVersion}/contracts`, validateJWT, contractRoutes);
router.use(`${apiVersion}/companies`, validateJWT, companyRoutes);
router.use(`${apiVersion}/notifications`, validateJWT, notificationRoutes);
router.use(`${apiVersion}/dashboard`, validateJWT, dashboardRoutes);
router.use(`${apiVersion}/analytics`, validateJWT, analyticsRoutes);
router.use(`${apiVersion}/license`, validateJWT, licenseRoutes);

// System stats (admin only)
router.get('/system-stats', validateJWT, indexController.getSystemStats);

// 404 handler for API routes
router.use((req, res, _next) => {
  res.status(404).json({
    status: 'error',
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

export default router;
