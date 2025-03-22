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
    totalTrend?: number;
    activeTrend?: number;
    expiredTrend?: number;
    expiringSoonTrend?: number;
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
  recentActions?: {
    id?: number;
    type: string;
    title: string;
    description: string;
    time: string;
    icon?: string;
    color?: string;
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
      
      // Log para debug
      console.log('Dashboard data loaded successfully for period:', days, 'days');
      
      return response.data;
    } catch (error: any) {
      // Mejorar el log de errores
      let errorMessage = 'Error al obtener los datos del dashboard';
      if (error.response) {
        // Error de respuesta del servidor
        console.error('Server error:', error.response.status, error.response.data);
        errorMessage = `Error del servidor: ${error.response.status} - ${error.response.data.message || 'Error desconocido'}`;
      } else if (error.request) {
        // Sin respuesta del servidor
        console.error('No response from server:', error.request);
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a Internet.';
      } else {
        // Error en la configuración de la solicitud
        console.error('Request setup error:', error.message);
        errorMessage = `Error en la solicitud: ${error.message}`;
      }
      
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Obtiene datos específicos del dashboard para un widget particular
   * @param widget Nombre del widget específico a cargar
   * @param days Período de tiempo en días
   * @returns Datos para el widget específico
   */
  async getWidgetData(widget: string, days: number = 30): Promise<any> {
    try {
      const response = await api.get(`/dashboard/${widget}?days=${days}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching widget data for ${widget}:`, error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService(); 