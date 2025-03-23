import moment from 'moment';
import { Contract } from '../models/contract.js';
import { User } from '../models/user.js';
import { Activity } from '../models/activityLog.js';
import { Op } from 'sequelize';
import sequelize from 'sequelize';

/**
 * Calcular tendencias para períodos anteriores
 * @param {number} current Valor actual 
 * @param {number} previous Valor del período anterior
 * @returns {number} Porcentaje de cambio
 */
const calculateChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Controlador para obtener datos analíticos generales
 */
export const getAnalyticsData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const preset = req.query.preset || 'monthly';
    
    const startDate = moment().subtract(days, 'days').toDate();
    const endDate = moment().toDate();
    
    // Métricas de contratos
    const totalContracts = await Contract.count();
    
    const activeContracts = await Contract.count({
      where: {
        status: 'active',
        endDate: { [Op.gte]: new Date() }
      }
    });
    
    const previousActiveCount = await Contract.count({
      where: {
        status: 'active',
        endDate: { 
          [Op.gte]: moment().subtract(days * 2, 'days').toDate(), 
          [Op.lte]: startDate 
        }
      }
    });
    
    const signedThisPeriod = await Contract.count({
      where: {
        createdAt: { 
          [Op.gte]: startDate, 
          [Op.lte]: endDate 
        }
      }
    });
    
    const previousSignedCount = await Contract.count({
      where: {
        createdAt: { 
          [Op.gte]: moment().subtract(days * 2, 'days').toDate(), 
          [Op.lte]: startDate 
        }
      }
    });
    
    const atRiskContracts = await Contract.count({
      where: {
        status: 'active',
        riskLevel: { [Op.in]: ['high', 'medium'] }
      }
    });
    
    const previousRiskCount = await Contract.count({
      where: {
        status: 'active',
        riskLevel: { [Op.in]: ['high', 'medium'] },
        updatedAt: { 
          [Op.gte]: moment().subtract(days * 2, 'days').toDate(), 
          [Op.lte]: startDate 
        }
      }
    });
    
    const expiringSoon = await Contract.count({
      where: {
        status: 'active',
        endDate: { 
          [Op.gte]: new Date(), 
          [Op.lte]: moment().add(30, 'days').toDate() 
        }
      }
    });
    
    const previousExpiringCount = await Contract.count({
      where: {
        status: 'active',
        endDate: { 
          [Op.gte]: startDate, 
          [Op.lte]: moment().subtract(days, 'days').add(30, 'days').toDate() 
        }
      }
    });
    
    // Datos de eficiencia (se podrían conectar a datos reales en una implementación futura)
    const efficiencyStats = [
      {
        label: 'Tiempo Promedio de Negociación',
        value: '5.2 días',
        trend: 'down',
        percentage: 12
      },
      {
        label: 'Tiempo hasta Firma',
        value: '8.5 días',
        trend: 'down',
        percentage: 8
      },
      {
        label: 'Tiempo de Aprobación',
        value: '2.3 días',
        trend: 'up',
        percentage: 5
      },
      {
        label: 'Tasa de Finalización',
        value: '92%',
        trend: 'up',
        percentage: 3
      }
    ];
    
    // Datos de cumplimiento (se podrían conectar a datos reales en una implementación futura)
    const complianceStats = [
      {
        label: 'Cláusulas Críticas',
        value: '45',
        trend: 'up',
        percentage: 15
      },
      {
        label: 'Alertas Pendientes',
        value: '12',
        trend: 'down',
        percentage: 25
      },
      {
        label: 'Incumplimientos',
        value: '3%',
        trend: 'down',
        percentage: 40
      },
      {
        label: 'En Litigio',
        value: '2',
        trend: 'down',
        percentage: 50
      }
    ];
    
    // Obtener distribución real de contratos por categoría
    const contractCategoriesData = await Contract.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });
    
    // Colores para las categorías
    const categoryColors = {
      'Servicios': '#4F46E5',
      'Proveedores': '#10B981',
      'Clientes': '#F59E0B',
      'Otros': '#6B7280',
      'Empleados': '#EC4899',
      'Tecnología': '#8B5CF6'
    };
    
    // Preparar datos de distribución
    const distribution = contractCategoriesData.map(cat => {
      const category = cat.category || 'Otros';
      return {
        category,
        count: parseInt(cat.count),
        percentage: Math.round((cat.count / (totalContracts || 1)) * 100),
        color: categoryColors[category] || '#6B7280'
      };
    });
    
    // Datos de tendencias históricas
    // En una implementación real, estos datos se obtendrían de la base de datos
    let labels = [];
    let contractsData = [];
    
    if (preset === 'monthly') {
      // Datos mensuales (últimos 30 días divididos en semanas)
      labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
      contractsData = [32, 45, 38, 52];
    } else if (preset === 'quarterly') {
      // Datos trimestrales (últimos 90 días divididos en meses)
      labels = [
        moment().subtract(3, 'months').format('MMM'),
        moment().subtract(2, 'months').format('MMM'),
        moment().subtract(1, 'months').format('MMM'),
        moment().format('MMM')
      ];
      contractsData = [85, 95, 102, 120];
    } else if (preset === 'yearly') {
      // Datos anuales (últimos 12 meses divididos en trimestres)
      labels = ['T1', 'T2', 'T3', 'T4'];
      contractsData = [230, 285, 310, 345];
    }
    
    // Datos de predicciones
    const predictions = [
      {
        title: 'Renovaciones Automáticas',
        value: '28',
        change: 12,
        isPositive: true
      },
      {
        title: 'Riesgo de Incumplimiento',
        value: '5%',
        change: 3,
        isPositive: false
      },
      {
        title: 'Ahorro Estimado',
        value: '$24,500',
        change: 15,
        isPositive: true
      },
      {
        title: 'Contratos a Renegociar',
        value: '18',
        change: 8,
        isPositive: true
      }
    ];
    
    // Organizar respuesta
    const analyticsData = {
      metrics: [
        {
          title: 'Contratos Activos',
          value: activeContracts.toString(),
          change: calculateChange(activeContracts, previousActiveCount),
          icon: 'fas fa-file-contract',
          colorClass: 'primary'
        },
        {
          title: 'Firmados este Periodo',
          value: signedThisPeriod.toString(),
          change: calculateChange(signedThisPeriod, previousSignedCount),
          icon: 'fas fa-check-circle',
          colorClass: 'success'
        },
        {
          title: 'En Riesgo',
          value: atRiskContracts.toString(),
          change: calculateChange(atRiskContracts, previousRiskCount),
          icon: 'fas fa-exclamation-triangle',
          colorClass: 'warning'
        },
        {
          title: 'Por Vencer',
          value: expiringSoon.toString(),
          change: calculateChange(expiringSoon, previousExpiringCount),
          icon: 'fas fa-clock',
          colorClass: 'info'
        }
      ],
      efficiency: efficiencyStats,
      compliance: complianceStats,
      predictions,
      distribution,
      trends: {
        labels,
        datasets: [{
          label: 'Contratos',
          data: contractsData,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 2
        }]
      }
    };
    
    res.json(analyticsData);
  } catch (error) {
    console.error('Error al obtener datos de analytics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener datos de analytics', 
      error: error.message 
    });
  }
};

/**
 * Controlador para obtener datos históricos con granularidad personalizada
 */
export const getHistoricalData = async (req, res) => {
  try {
    const { dataType, granularity, startDate, endDate } = req.query;
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Validar parámetros
    if (!dataType || !granularity || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros incompletos. Se requiere dataType, granularity, startDate y endDate'
      });
    }
    
    // Validar granularidad
    if (!['day', 'week', 'month', 'quarter', 'year'].includes(granularity)) {
      return res.status(400).json({
        success: false,
        message: `Granularidad '${granularity}' no soportada`
      });
    }
    
    // Configurar el formato para agrupar por granularidad
    let dateFormat;
    let timeGrouping;
    
    switch (granularity) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        timeGrouping = "DATE(createdAt)";
        break;
      case 'week':
        dateFormat = '%Y-%U';
        timeGrouping = "YEARWEEK(createdAt, 1)";
        break;
      case 'month':
        dateFormat = '%Y-%m';
        timeGrouping = "DATE_FORMAT(createdAt, '%Y-%m')";
        break;
      case 'quarter':
        dateFormat = '%Y-Q%q';
        timeGrouping = "CONCAT(YEAR(createdAt), '-Q', QUARTER(createdAt))";
        break;
      case 'year':
        dateFormat = '%Y';
        timeGrouping = "YEAR(createdAt)";
        break;
    }
    
    // Procesar diferentes tipos de datos
    let labels = [];
    let datasets = [];
    
    switch (dataType) {
      case 'contracts': {
        // Obtener datos para gráfico de contratos por estado
        const statusColors = {
          active: '#10b981', // Verde
          pending: '#f59e0b', // Ámbar
          expired: '#ef4444', // Rojo
          cancelled: '#9ca3af'  // Gris
        };
        
        const statuses = ['active', 'pending', 'expired', 'cancelled'];
        
        // Consultar datos agrupados por período y estado
        const historicalData = await Contract.findAll({
          attributes: [
            [sequelize.literal(timeGrouping), 'period'],
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            createdAt: {
              [Op.between]: [parsedStartDate, parsedEndDate]
            }
          },
          group: ['period', 'status'],
          order: [[sequelize.literal('period'), 'ASC']]
        });
        
        // Procesar y organizar datos
        const groupedByPeriod = {};
        
        historicalData.forEach(record => {
          const { period, status, count } = record.dataValues;
          
          if (!groupedByPeriod[period]) {
            groupedByPeriod[period] = {
              active: 0,
              pending: 0,
              expired: 0,
              cancelled: 0
            };
          }
          
          groupedByPeriod[period][status] = count;
        });
        
        // Ordenar períodos
        labels = Object.keys(groupedByPeriod).sort();
        
        // Crear datasets para cada estado
        datasets = statuses.map(status => ({
          label: status.charAt(0).toUpperCase() + status.slice(1),
          data: labels.map(period => groupedByPeriod[period][status] || 0),
          borderColor: statusColors[status],
          backgroundColor: `${statusColors[status]}33`,
          borderWidth: 2
        }));
        
        break;
      }
      
      case 'value': {
        // Obtener datos para gráfico de valor de contratos
        const historicalData = await Contract.findAll({
          attributes: [
            [sequelize.literal(timeGrouping), 'period'],
            [sequelize.fn('SUM', sequelize.col('value')), 'totalValue']
          ],
          where: {
            createdAt: {
              [Op.between]: [parsedStartDate, parsedEndDate]
            }
          },
          group: ['period'],
          order: [[sequelize.literal('period'), 'ASC']]
        });
        
        labels = historicalData.map(record => record.dataValues.period);
        datasets = [{
          label: 'Valor Total de Contratos',
          data: historicalData.map(record => parseFloat(record.dataValues.totalValue) || 0),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true
        }];
        
        break;
      }
      
      case 'risk': {
        // Obtener datos para gráfico de contratos por nivel de riesgo
        const riskColors = {
          high: '#ef4444',    // Rojo
          medium: '#f59e0b',  // Ámbar
          low: '#10b981'      // Verde
        };
        
        const riskLevels = ['high', 'medium', 'low'];
        
        const historicalData = await Contract.findAll({
          attributes: [
            [sequelize.literal(timeGrouping), 'period'],
            'riskLevel',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          where: {
            createdAt: {
              [Op.between]: [parsedStartDate, parsedEndDate]
            },
            riskLevel: {
              [Op.in]: riskLevels
            }
          },
          group: ['period', 'riskLevel'],
          order: [[sequelize.literal('period'), 'ASC']]
        });
        
        // Procesar y organizar datos
        const groupedByPeriod = {};
        
        historicalData.forEach(record => {
          const { period, riskLevel, count } = record.dataValues;
          
          if (!groupedByPeriod[period]) {
            groupedByPeriod[period] = {
              high: 0,
              medium: 0,
              low: 0
            };
          }
          
          groupedByPeriod[period][riskLevel] = count;
        });
        
        // Ordenar períodos
        labels = Object.keys(groupedByPeriod).sort();
        
        // Crear datasets para cada nivel de riesgo
        datasets = riskLevels.map(level => ({
          label: level.charAt(0).toUpperCase() + level.slice(1),
          data: labels.map(period => groupedByPeriod[period][level] || 0),
          borderColor: riskColors[level],
          backgroundColor: `${riskColors[level]}33`,
          borderWidth: 2
        }));
        
        break;
      }
      
      default:
        return res.status(400).json({
          success: false,
          message: `Tipo de datos '${dataType}' no soportado`
        });
    }
    
    res.json({
      labels,
      datasets
    });
    
  } catch (error) {
    console.error('Error getting historical data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener datos históricos',
      error: error.message
    });
  }
};

/**
 * Controlador para generar reportes exportables
 */
export const generateReport = async (req, res) => {
  try {
    const { format } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    // Validar formato
    if (!['pdf', 'excel', 'csv'].includes(format)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato no soportado' 
      });
    }
    
    // Simulamos la generación de un reporte
    // En una implementación real, aquí se generaría el archivo y se devolvería la URL
    
    const reportUrl = `/reports/analytics_${format}_${Date.now()}.${format}`;
    
    setTimeout(() => {
      res.json({ 
        success: true,
        reportUrl 
      });
    }, 2000); // Simulación de tiempo de generación
    
  } catch (error) {
    console.error(`Error generando reporte ${req.params.format}:`, error);
    res.status(500).json({ 
      success: false,
      message: 'Error al generar el reporte', 
      error: error.message 
    });
  }
};

/**
 * Controlador para obtener análisis específicos
 */
export const getSpecificAnalysis = async (req, res) => {
  try {
    const { analysisType } = req.params;
    
    // Validar y procesar tipo de análisis
    if (!['contracts', 'risks', 'performance'].includes(analysisType)) {
      return res.status(400).json({ 
        success: false, 
        message: `Tipo de análisis '${analysisType}' no soportado` 
      });
    }
    
    let data = {};
    
    switch (analysisType) {
      case 'contracts':
        // En una implementación real, estos datos vendrían de la base de datos
        data = {
          totalCount: await Contract.count(),
          activeContracts: await Contract.count({ where: { status: 'active' }}),
          pendingContracts: await Contract.count({ where: { status: 'pending' }}),
          expiredContracts: await Contract.count({ where: { status: 'expired' }}),
          averageValue: await Contract.findOne({
            attributes: [
              [sequelize.fn('AVG', sequelize.col('value')), 'avgValue']
            ],
            raw: true
          }).then(result => result.avgValue || 0),
          categories: await Contract.findAll({
            attributes: [
              'category',
              [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['category'],
            raw: true
          }).then(results => {
            const categories = {};
            results.forEach(item => {
              categories[item.category || 'Otros'] = parseInt(item.count);
            });
            return categories;
          }),
          statuses: await Contract.findAll({
            attributes: [
              'status',
              [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
          }).then(results => {
            const statuses = {};
            results.forEach(item => {
              statuses[item.status || 'undefined'] = parseInt(item.count);
            });
            return statuses;
          })
        };
        break;
        
      case 'risks':
        // En una implementación real, estos datos vendrían de la base de datos
        data = {
          highRiskCount: await Contract.count({ where: { riskLevel: 'high' }}),
          mediumRiskCount: await Contract.count({ where: { riskLevel: 'medium' }}),
          lowRiskCount: await Contract.count({ where: { riskLevel: 'low' }}),
          // Estos datos podrían provenir de un análisis real de riesgos
          topRiskFactors: [
            { factor: 'Cláusulas de terminación', count: 8 },
            { factor: 'Retrasos en pagos', count: 7 },
            { factor: 'Obligaciones incumplidas', count: 5 },
            { factor: 'Documentación incompleta', count: 4 }
          ]
        };
        break;
        
      case 'performance':
        // En una implementación real, estos datos vendrían de análisis de la DB
        data = {
          approvalTime: {
            average: '2.3 días',
            trend: 'decreasing',
            change: -12
          },
          negotiationTime: {
            average: '5.2 días',
            trend: 'decreasing',
            change: -8
          },
          completionRate: {
            value: '92%',
            trend: 'increasing',
            change: 3
          }
        };
        break;
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error getting specific analysis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener análisis específico',
      error: error.message 
    });
  }
};

/**
 * Obtener contratos en riesgo para la tabla de analíticas
 */
export const getRiskContracts = async (req, res) => {
  try {
    const riskContracts = await Contract.findAll({
      where: {
        status: 'active',
        riskLevel: {
          [Op.in]: ['high', 'medium']
        }
      },
      attributes: [
        'id', 
        'name', 
        'category', 
        'riskLevel', 
        'endDate', 
        'status'
      ],
      order: [
        ['riskLevel', 'ASC'],
        ['endDate', 'ASC']
      ],
      limit: 10
    });
    
    res.json({
      success: true,
      data: riskContracts
    });
  } catch (error) {
    console.error('Error al obtener contratos en riesgo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contratos en riesgo',
      error: error.message
    });
  }
}; 