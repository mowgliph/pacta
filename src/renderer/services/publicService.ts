import { electronAPI } from '@/renderer/api/electronAPI';

interface PublicStatistics {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  chartData: {
    monthly: Array<{ month: string; contratos: number }>;
    byType: Array<{ type: string; count: number }>;
  };
}

interface PublicContract {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface PublicDashboardData {
  statistics: {
    total: number;
    activePercentage: number;
    efficiency: number;
  };
  recentActivity: PublicContract[];
  charts: {
    monthly: Array<{ month: string; contratos: number }>;
  };
}

const publicService = {
  getDashboardData: async (): Promise<PublicDashboardData> => {
    return electronAPI.statistics.getPublic();
  },

  getStatistics: async (): Promise<PublicStatistics> => {
    return electronAPI.statistics.getPublic();
  },

  getContracts: async (): Promise<PublicContract[]> => {
    const contracts = await electronAPI.contracts.getAll();
    return contracts.map(contract => ({
      id: contract.id,
      name: contract.name,
      type: contract.type,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate.toISOString(),
      status: contract.status
    }));
  }
};

export type { PublicStatistics, PublicContract, PublicDashboardData };
export default publicService;