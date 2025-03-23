import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDashboardData } from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard endpoint - Provides consolidated statistics for the dashboard
router.get('/', authenticateToken, getDashboardData);

export default router; 