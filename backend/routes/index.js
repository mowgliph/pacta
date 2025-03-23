import express from 'express';
import authRoutes from './auth.js';
import protectedRoutes from './protected.js';
import contractRoutes from './contracts.js';
import dashboardRoutes from './dashboard.js';
import analyticsRoutes from './analytics.js';
import notificationRoutes from './notifications.js';
import userRoutes from './users.js';
import licenseRoutes from './license.routes.js';

const router = express.Router();

// API versioning
const apiV1 = express.Router();

// Register all routes under v1 namespace
apiV1.use('/auth', authRoutes);
apiV1.use('/contracts', contractRoutes);
apiV1.use('/dashboard', dashboardRoutes);
apiV1.use('/analytics', analyticsRoutes);
apiV1.use('/notifications', notificationRoutes);
apiV1.use('/users', userRoutes);
apiV1.use('/license', licenseRoutes);
apiV1.use('/', protectedRoutes);

// Mount v1 routes at /api/v1
router.use('/v1', apiV1);

// For backward compatibility, also mount the routes at /api
router.use('/', apiV1);

export default router; 