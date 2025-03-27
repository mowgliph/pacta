import { BaseController } from './BaseController.js';
import { AnalyticsService } from '../../services/AnalyticsService.js';
import { ValidationService } from '../../services/ValidationService.js';
import { ValidationError } from '../../utils/errors.js';


export class AnalyticsController extends BaseController {
  constructor() {
    const analyticsService = new AnalyticsService();
    super(analyticsService);
    this.analyticsService = analyticsService;
    this.validationService = new ValidationService();
  }

  getAnalyticsData = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { days = 30, preset = 'monthly' } = req.query;
        return await this.analyticsService.getAnalyticsData(parseInt(days), preset);
      },
      { days: req.query.days, preset: req.query.preset }
    );
  };

  getHistoricalData = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { dataType, granularity, startDate, endDate } = req.query;
        if (!dataType || !granularity || !startDate || !endDate) {
          throw new ValidationError('Parámetros incompletos');
        }
        return await this.analyticsService.getHistoricalData(dataType, granularity, startDate, endDate);
      },
      { 
        dataType: req.query.dataType,
        granularity: req.query.granularity,
        dateRange: { startDate: req.query.startDate, endDate: req.query.endDate }
      }
    );
  };

  generateReport = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { format } = req.params;
        const { days = 30 } = req.query;
        
        if (!['pdf', 'excel', 'csv'].includes(format)) {
          throw new ValidationError('Formato no soportado');
        }
        
        return await this.analyticsService.generateReport(format, parseInt(days));
      },
      { format: req.params.format, days: req.query.days }
    );
  };

  getSpecificAnalysis = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { analysisType } = req.params;
        if (!['contracts', 'risks', 'performance'].includes(analysisType)) {
          throw new ValidationError(`Tipo de análisis '${analysisType}' no soportado`);
        }
        return await this.analyticsService.getSpecificAnalysis(analysisType);
      },
      { analysisType: req.params.analysisType }
    );
  };

  getRiskContracts = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        return await this.analyticsService.getRiskContracts();
      },
      {}
    );
  };

  getGeneralStats = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        return await this.analyticsService.getGeneralStats();
      },
      {}
    );
  };

  getActivityStats = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { startDate, endDate } = req.query;
        return await this.analyticsService.getActivityStats(startDate, endDate);
      },
      { dateRange: { startDate: req.query.startDate, endDate: req.query.endDate } }
    );
  };

  getContractStats = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        return await this.analyticsService.getContractStats();
      },
      {}
    );
  };

  getUserActivity = async (req, res) => {
    return this.handleAsync(
      req,
      res,
      null,
      async () => {
        const { userId } = req.params;
        return await this.analyticsService.getUserActivity(parseInt(userId));
      },
      { userId: req.params.userId }
    );
  };
}