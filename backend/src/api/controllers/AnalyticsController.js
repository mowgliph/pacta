import moment from 'moment';
import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { ContractStatus, ContractType } from '@prisma/client';

/**
 * Calcular tendencias para períodos anteriores
 * @param {number} current Valor actual
 * @param {number} previous Valor del período anterior
 * @returns {number} Porcentaje de cambio
 */
const calculateChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Controlador para obtener datos analíticos generales
 */
export const getAnalyticsData = async (req, res) => {
  try {
    const _period = parseInt(req.query.days) || 30;
    const preset = req.query.preset || 'monthly';

    const startDate = moment().subtract(_period, 'days').toDate();
    const endDate = moment().toDate();

    // Métricas de contratos
    const totalContracts = await prisma.contract.count();

    const activeContracts = await prisma.contract.count({
      where: {
        status: 'active',
        endDate: { gte: new Date() },
      },
    });

    const previousActiveCount = await prisma.contract.count({
      where: {
        status: 'active',
        endDate: {
          gte: moment().subtract(_period * 2, 'days').toDate(),
          lte: startDate,
        },
      },
    });

    const signedThisPeriod = await prisma.contract.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const previousSignedCount = await prisma.contract.count({
      where: {
        createdAt: {
          gte: moment().subtract(_period * 2, 'days').toDate(),
          lte: startDate,
        },
      },
    });

    const atRiskContracts = await prisma.contract.count({
      where: {
        status: 'active',
        riskLevel: { in: ['high', 'medium'] },
      },
    });

    const previousRiskCount = await prisma.contract.count({
      where: {
        status: 'active',
        riskLevel: { in: ['high', 'medium'] },
        updatedAt: {
          gte: moment().subtract(_period * 2, 'days').toDate(),
          lte: startDate,
        },
      },
    });

    const expiringSoon = await prisma.contract.count({
      where: {
        status: 'active',
        endDate: {
          gte: new Date(),
          lte: moment().add(30, 'days').toDate(),
        },
      },
    });

    const previousExpiringCount = await prisma.contract.count({
      where: {
        status: 'active',
        endDate: {
          gte: startDate,
          lte: moment().subtract(_period, 'days').add(30, 'days').toDate(),
        },
      },
    });

    // Datos de eficiencia (se podrían conectar a datos reales en una implementación futura)
    const efficiencyStats = [
      {
        label: 'Tiempo Promedio de Negociación',
        value: '5.2 días',
        trend: 'down',
        percentage: 12,
      },
      {
        label: 'Tiempo hasta Firma',
        value: '8.5 días',
        trend: 'down',
        percentage: 8,
      },
      {
        label: 'Tiempo de Aprobación',
        value: '2.3 días',
        trend: 'up',
        percentage: 5,
      },
      {
        label: 'Tasa de Finalización',
        value: '92%',
        trend: 'up',
        percentage: 3,
      },
    ];

    // Datos de cumplimiento (se podrían conectar a datos reales en una implementación futura)
    const complianceStats = [
      {
        label: 'Cláusulas Críticas',
        value: '45',
        trend: 'up',
        percentage: 15,
      },
      {
        label: 'Alertas Pendientes',
        value: '12',
        trend: 'down',
        percentage: 25,
      },
      {
        label: 'Incumplimientos',
        value: '3%',
        trend: 'down',
        percentage: 40,
      },
      {
        label: 'En Litigio',
        value: '2',
        trend: 'down',
        percentage: 50,
      },
    ];

    // Obtener distribución real de contratos por categoría
    const contractCategoriesData = await prisma.contract.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });

    // Colores para las categorías
    const categoryColors = {
      Servicios: '#4F46E5',
      Proveedores: '#10B981',
      Clientes: '#F59E0B',
      Otros: '#6B7280',
      Empleados: '#EC4899',
      Tecnología: '#8B5CF6',
    };

    // Preparar datos de distribución
    const distribution = contractCategoriesData.map(cat => {
      const category = cat.category || 'Otros';
      return {
        category,
        count: cat._count.category,
        percentage: Math.round((cat._count.category / (totalContracts || 1)) * 100),
        color: categoryColors[category] || '#6B7280',
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
        moment().format('MMM'),
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
        isPositive: true,
      },
      {
        title: 'Riesgo de Incumplimiento',
        value: '5%',
        change: 3,
        isPositive: false,
      },
      {
        title: 'Ahorro Estimado',
        value: '$24,500',
        change: 15,
        isPositive: true,
      },
      {
        title: 'Contratos a Renegociar',
        value: '18',
        change: 8,
        isPositive: true,
      },
    ];

    // Organizar respuesta
    const analyticsData = {
      metrics: [
        {
          title: 'Contratos Activos',
          value: activeContracts.toString(),
          change: calculateChange(activeContracts, previousActiveCount),
          icon: 'fas fa-file-contract',
          colorClass: 'primary',
        },
        {
          title: 'Firmados este Periodo',
          value: signedThisPeriod.toString(),
          change: calculateChange(signedThisPeriod, previousSignedCount),
          icon: 'fas fa-check-circle',
          colorClass: 'success',
        },
        {
          title: 'En Riesgo',
          value: atRiskContracts.toString(),
          change: calculateChange(atRiskContracts, previousRiskCount),
          icon: 'fas fa-exclamation-triangle',
          colorClass: 'warning',
        },
        {
          title: 'Por Vencer',
          value: expiringSoon.toString(),
          change: calculateChange(expiringSoon, previousExpiringCount),
          icon: 'fas fa-clock',
          colorClass: 'info',
        },
      ],
      efficiency: efficiencyStats,
      compliance: complianceStats,
      predictions,
      distribution,
      trends: {
        labels,
        datasets: [
          {
            label: 'Contratos',
            data: contractsData,
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
          },
        ],
      },
    };

    res.json(analyticsData);
  } catch (error) {
    logger.error('Error al obtener datos de analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de analytics',
      error: error.message,
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
        message: 'Parámetros incompletos. Se requiere dataType, granularity, startDate y endDate',
      });
    }

    // Validar granularidad
    if (!['day', 'week', 'month', 'quarter', 'year'].includes(granularity)) {
      return res.status(400).json({
        success: false,
        message: `Granularidad '${granularity}' no soportada`,
      });
    }

    // Utilizamos SQL nativo para obtener datos agrupados
    let labels = [];
    let datasets = [];

    switch (dataType) {
      case 'contracts': {
        // Obtener datos para gráfico de contratos por estado
        const statusColors = {
          active: '#10b981', // Verde
          pending: '#f59e0b', // Ámbar
          expired: '#ef4444', // Rojo
          cancelled: '#9ca3af', // Gris
        };

        const statuses = ['active', 'pending', 'expired', 'cancelled'];
        
        // Para SQLite, usamos consulta nativa con prisma.$queryRaw
        const historicalData = await prisma.$queryRaw`
          SELECT 
            strftime('%Y-%m', createdAt) as period,
            status,
            COUNT(*) as count
          FROM Contract
          WHERE createdAt BETWEEN ${parsedStartDate} AND ${parsedEndDate}
          GROUP BY period, status
          ORDER BY period ASC
        `;

        // Procesar y organizar datos
        const groupedByPeriod = {};

        historicalData.forEach(record => {
          const { period, status, count } = record;

          if (!groupedByPeriod[period]) {
            groupedByPeriod[period] = {
              active: 0,
              pending: 0,
              expired: 0,
              cancelled: 0,
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
          borderWidth: 2,
        }));

        break;
      }

      case 'value': {
        // Obtener datos para gráfico de valor de contratos
        const historicalData = await prisma.$queryRaw`
          SELECT 
            strftime('%Y-%m', createdAt) as period,
            SUM(value) as totalValue
          FROM Contract
          WHERE createdAt BETWEEN ${parsedStartDate} AND ${parsedEndDate}
          GROUP BY period
          ORDER BY period ASC
        `;

        labels = historicalData.map(record => record.period);
        datasets = [
          {
            label: 'Valor Total de Contratos',
            data: historicalData.map(record => parseFloat(record.totalValue) || 0),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
          },
        ];

        break;
      }

      case 'risk': {
        // Obtener datos para gráfico de contratos por nivel de riesgo
        const riskColors = {
          high: '#ef4444', // Rojo
          medium: '#f59e0b', // Ámbar
          low: '#10b981', // Verde
        };

        const riskLevels = ['high', 'medium', 'low'];

        const historicalData = await prisma.$queryRaw`
          SELECT 
            strftime('%Y-%m', createdAt) as period,
            riskLevel,
            COUNT(*) as count
          FROM Contract
          WHERE 
            createdAt BETWEEN ${parsedStartDate} AND ${parsedEndDate}
            AND riskLevel IN ('high', 'medium', 'low')
          GROUP BY period, riskLevel
          ORDER BY period ASC
        `;

        // Procesar y organizar datos
        const groupedByPeriod = {};

        historicalData.forEach(record => {
          const { period, riskLevel, count } = record;

          if (!groupedByPeriod[period]) {
            groupedByPeriod[period] = {
              high: 0,
              medium: 0,
              low: 0,
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
          borderWidth: 2,
        }));

        break;
      }

      default:
        return res.status(400).json({
          success: false,
          message: `Tipo de datos '${dataType}' no soportado`,
        });
    }

    res.json({
      labels,
      datasets,
    });
  } catch (error) {
    logger.error('Error getting historical data:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos históricos',
      error: error.message,
    });
  }
};

/**
 * Controlador para generar reportes exportables
 */
export const generateReport = async (req, res) => {
  try {
    const { format } = req.params;
    const _period = parseInt(req.query.days) || 30;

    // Validar formato
    if (!['pdf', 'excel', 'csv'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Formato no soportado',
      });
    }

    // Simulamos la generación de un reporte
    // En una implementación real, aquí se generaría el archivo y se devolvería la URL

    const reportUrl = `/reports/analytics_${format}_${Date.now()}.${format}`;

    setTimeout(() => {
      res.json({
        success: true,
        reportUrl,
      });
    }, 2000); // Simulación de tiempo de generación
  } catch (error) {
    logger.error(`Error generando reporte ${req.params.format}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte',
      error: error.message,
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
        message: `Tipo de análisis '${analysisType}' no soportado`,
      });
    }

    let data = {};

    switch (analysisType) {
      case 'contracts':
        // Utilizamos Prisma para obtener los datos de análisis
        const totalCount = await prisma.contract.count();
        const activeContracts = await prisma.contract.count({ where: { status: 'active' } });
        const pendingContracts = await prisma.contract.count({ where: { status: 'pending' } });
        const expiredContracts = await prisma.contract.count({ where: { status: 'expired' } });
        
        // Valor promedio con Prisma
        const avgValueResult = await prisma.contract.aggregate({
          _avg: {
            value: true
          }
        });
        
        // Categorías con Prisma
        const categoriesResult = await prisma.contract.groupBy({
          by: ['category'],
          _count: {
            id: true
          }
        });
        
        const categories = {};
        categoriesResult.forEach(item => {
          categories[item.category || 'Otros'] = item._count.id;
        });
        
        // Estados con Prisma
        const statusesResult = await prisma.contract.groupBy({
          by: ['status'],
          _count: {
            id: true
          }
        });
        
        const statuses = {};
        statusesResult.forEach(item => {
          statuses[item.status || 'undefined'] = item._count.id;
        });
        
        data = {
          totalCount,
          activeContracts,
          pendingContracts,
          expiredContracts,
          averageValue: avgValueResult._avg.value || 0,
          categories,
          statuses
        };
        break;

      case 'risks':
        // Obtener datos de riesgos con Prisma
        data = {
          highRiskCount: await prisma.contract.count({ where: { riskLevel: 'high' } }),
          mediumRiskCount: await prisma.contract.count({ where: { riskLevel: 'medium' } }),
          lowRiskCount: await prisma.contract.count({ where: { riskLevel: 'low' } }),
          // Estos datos podrían provenir de un análisis real de riesgos
          topRiskFactors: [
            { factor: 'Cláusulas de terminación', count: 8 },
            { factor: 'Retrasos en pagos', count: 7 },
            { factor: 'Obligaciones incumplidas', count: 5 },
            { factor: 'Documentación incompleta', count: 4 },
          ],
        };
        break;

      case 'performance':
        // En una implementación real, estos datos vendrían de análisis de la DB
        data = {
          approvalTime: {
            average: '2.3 días',
            trend: 'decreasing',
            change: -12,
          },
          negotiationTime: {
            average: '5.2 días',
            trend: 'decreasing',
            change: -8,
          },
          completionRate: {
            value: '92%',
            trend: 'increasing',
            change: 3,
          },
        };
        break;
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error('Error getting specific analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener análisis específico',
      error: error.message,
    });
  }
};

/**
 * Obtener contratos en riesgo para la tabla de analíticas
 */
export const getRiskContracts = async (req, res) => {
  try {
    const riskContracts = await prisma.contract.findMany({
      where: {
        status: 'active',
        riskLevel: {
          in: ['high', 'medium'],
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        riskLevel: true,
        endDate: true,
        status: true
      },
      orderBy: [
        { riskLevel: 'asc' },
        { endDate: 'asc' },
      ],
      take: 10,
    });

    res.json({
      success: true,
      data: riskContracts,
    });
  } catch (error) {
    logger.error('Error al obtener contratos en riesgo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contratos en riesgo',
      error: error.message,
    });
  }
};

// Obtener estadísticas generales
export const getGeneralStats = async (req, res) => {
  try {
    const [totalUsers, totalContracts, activeContracts, recentActivities] = await Promise.all([
      prisma.user.count(),
      prisma.contract.count(),
      prisma.contract.count({ where: { status: 'active' } }),
      prisma.activityLog.findMany({
        include: {
          user: {
            select: {
              username: true
            }
          },
          contract: {
            select: {
              contractNumber: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 10
      }),
    ]);

    res.json({
      totalUsers,
      totalContracts,
      activeContracts,
      recentActivities,
    });
  } catch (error) {
    logger.error('Error getting general stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas generales' });
  }
};

// Obtener estadísticas de actividad por período
export const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {
      timestamp: {
        gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lte: endDate ? new Date(endDate) : new Date(),
      },
    };

    const activities = await prisma.activityLog.groupBy({
      by: ['action'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    res.json(activities.map(item => ({
      action: item.action,
      count: item._count.id
    })));
  } catch (error) {
    logger.error('Error getting activity stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de actividad' });
  }
};

// Obtener estadísticas de contratos por estado
export const getContractStats = async (req, res) => {
  try {
    const stats = await prisma.contract.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    res.json(stats.map(item => ({
      status: item.status,
      count: item._count.id
    })));
  } catch (error) {
    logger.error('Error getting contract stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de contratos' });
  }
};

// Obtener actividad reciente por usuario
export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const activities = await prisma.activityLog.findMany({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            username: true
          }
        },
        contract: {
          select: {
            contractNumber: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 20
    });

    res.json(activities);
  } catch (error) {
    logger.error('Error getting user activity:', error);
    res.status(500).json({ message: 'Error al obtener actividad del usuario' });
  }
};

