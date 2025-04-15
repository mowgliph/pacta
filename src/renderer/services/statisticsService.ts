import { electronAPI } from '@/renderer/api/electronAPI';

interface StatisticsData {
  totalContracts?: number;
  activeContracts?: number;
  expiringContracts?: number;
  [key: string]: any;
}

class StatisticsService {
  async getGeneralStatistics(): Promise<StatisticsData> {
    try {
      return await electronAPI.statistics.getPublic();
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw error;
    }
  }

  async getPrivateStatistics(): Promise<StatisticsData> {
    try {
      return await electronAPI.statistics.getPrivate();
    } catch (error) {
      console.error('Error al obtener estadísticas privadas:', error);
      throw error;
    }
  }

  async exportReport(data: StatisticsData): Promise<any> {
    try {
      return await electronAPI.statistics.exportReport(data);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      throw error;
    }
  }
}

const statisticsService = new StatisticsService();
export default statisticsService;