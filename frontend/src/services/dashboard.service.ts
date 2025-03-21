import api from './api';

/**
 * Interfaces para los tipos de datos utilizados en el dashboard
 */
interface Contract {
  id: number;
  title: string;
  contractNumber: string;
  endDate: string;
  createdAt: string;
  type: string;
  status: string;
  renewalStatus: string;
  companyId: number;
}

/**
 * Tipo de respuesta para la llamada al backend del dashboard
 */
export interface DashboardResponse {
  contractStats: {
    total: number;
    active: number;
    expired: number;
    expiringSoon: number;
    newInPeriod: number;
  };
  license: {
    status: string;
    expiryDate: string;
    type: string;
    remainingDays: number;
    registeredCompanies: number;
    activeUsers: number;
  } | null;
  contractTrends: {
    newToday: number;
    newThisWeek: number;
    reviewPending: number;
    renewalsPending: number;
  };
  contractCategories: {
    name: string;
    count: number;
    percentage: number;
  }[];
  recentActivities: {
    id: number;
    title: string;
    time: string;
    icon: string;
    color: string;
  }[];
}

class DashboardService {
  /**
   * Obtiene los datos del dashboard para un período de tiempo específico
   * @param days Número de días para filtrar los datos
   * @returns Datos del dashboard
   */
  async getDashboardData(days: number = 30): Promise<DashboardResponse> {
    try {
      // Obtener datos directamente del endpoint del dashboard
      const response = await api.get<DashboardResponse>(`/dashboard?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService(); 