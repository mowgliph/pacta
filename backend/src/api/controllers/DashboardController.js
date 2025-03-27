import { User, Contract, License, ActivityLog } from '../models/index.js';
import { BaseController } from './BaseController.js';
import { DashboardService } from '../../services/DashboardService.js';
import { ValidationError } from '../../utils/errors.js';

export class DashboardController extends BaseController {
  constructor() {
    const dashboardService = new DashboardService();
    super(dashboardService);
    this.dashboardService = dashboardService;
  }

  getDashboardData = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { days = 30 } = req.query;
        const daysNum = parseInt(days, 10);
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        const dashboardData = await this.dashboardService.getDashboardData({
          days: daysNum,
          userId,
          isAdmin
        });

        return {
          contractStats: dashboardData.contractStats,
          license: dashboardData.license,
          contractTrends: dashboardData.contractTrends,
          contractCategories: dashboardData.contractCategories,
          recentActivities: dashboardData.recentActivities
        };
      },
      { 
        days: req.query.days,
        userId: req.user.id,
        role: req.user.role
      }
    );
  };

  getOverview = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { startDate, endDate } = req.query;
        return await this.dashboardService.getOverview(startDate, endDate);
      },
      { dateRange: { startDate: req.query.startDate, endDate: req.query.endDate } }
    );
  };

  getStatistics = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { type, period } = req.query;
        if (!type || !period) {
          throw new ValidationError('Tipo y período son requeridos');
        }
        return await this.dashboardService.getStatistics(type, period);
      },
      { type: req.query.type, period: req.query.period }
    );
  };

  getRecentActivity = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const limit = parseInt(req.query.limit) || 10;
        return await this.dashboardService.getRecentActivity(limit);
      },
      { limit: req.query.limit }
    );
  };

  getUserMetrics = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const userId = req.user.id;
        return await this.dashboardService.getUserMetrics(userId);
      },
      { userId: req.user.id }
    );
  };
}
