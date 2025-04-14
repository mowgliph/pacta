import { electronAPI } from '../api/electronAPI';

class StatisticsService {
  async getStatistics() {
    try {
      return await electronAPI.invoke('statistics:fetch');
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  async getExpiringContracts(days: number = 30) {
    try {
      return await electronAPI.invoke('expiring-contracts:fetch', days);
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      throw error;
    }
  }

  async getSupplementActivity(limit: number = 5) {
    try {
      return await electronAPI.invoke('supplement-activity:fetch', limit);
    } catch (error) {
      console.error('Error fetching supplement activity:', error);
      throw error;
    }
  }

  async getPublicStatistics() {
    try {
      return await electronAPI.invoke('public:statistics');
    } catch (error) {
      console.error('Error fetching public statistics:', error);
      throw error;
    }
  }

  async getContractStats(filters?: any) {
    try {
      const stats = await this.getStatistics();
      const expiringContracts = await this.getExpiringContracts();
      const supplementActivity = await this.getSupplementActivity();

      return {
        ...stats,
        expiringContracts,
        supplementActivity
      };
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      throw error;
    }
  }
}

export const statisticsService = new StatisticsService();