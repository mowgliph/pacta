import { fetchStatistics } from '../api/electronAPI';

const statisticsService = {
  // Obtener estadísticas generales
  getGeneralStatistics: async () => {
    try {
      return await fetchStatistics();
    } catch (error) {
      console.error('Error en statisticsService.getGeneralStatistics:', error);
      throw error;
    }
  },

  // Calcular estadísticas de contratos
  calculateContractStatistics: (contracts) => {
    const total = contracts.length;
    const active = contracts.filter(c => c.status === 'active').length;
    const expiring = contracts.filter(c => {
      const endDate = new Date(c.endDate);
      const now = new Date();
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;

    return {
      total,
      active,
      expiring,
      inactive: total - active
    };
  },

  // Calcular estadísticas de suplementos
  calculateSupplementStatistics: (contracts) => {
    const supplements = contracts.flatMap(c => c.supplements || []);
    const totalAmount = supplements.reduce((sum, s) => sum + s.amount, 0);
    const averageAmount = supplements.length > 0 ? totalAmount / supplements.length : 0;

    return {
      totalSupplements: supplements.length,
      totalAmount,
      averageAmount
    };
  },

  // Generar reporte de tendencias
  generateTrendReport: (contracts) => {
    const monthlyData = {};
    contracts.forEach(contract => {
      const month = new Date(contract.createdAt).toLocaleString('es-ES', { month: 'long' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count
    }));
  }
};

export default statisticsService;