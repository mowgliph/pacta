import express from 'express';
import { authenticateToken } from '../api/middleware/auth.js';
import { getDashboardData } from '../api/controllers/dashboardController.js';

const router = express.Router();

// Dashboard endpoint - Provides consolidated statistics for the dashboard
router.get('/', authenticateToken, getDashboardData);

export default router; 