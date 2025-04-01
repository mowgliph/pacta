import { api } from '@/lib/api';

// Tipos para las actividades recientes
export interface Activity {
  id: string;
  type: 'contract' | 'user' | 'company' | 'event';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userAvatar?: string;
  userName?: string;
}

// Tipo para contratos próximos a vencer
export interface UpcomingContract {
  id: string;
  name: string;
  company: string;
  expirationDate: string;
  daysRemaining: number;
  status: 'active' | 'pending' | 'expired';
}

// Tipo para estadísticas de contratos
export interface ContractStats {
  labels: string[];
  data: number[];
}

// Tipo para las estadísticas del dashboard
export interface DashboardStats {
  activeContracts: number;
  pendingRenewals: number;
  totalUsers: number;
  alerts: number;
  contractsStats: ContractStats;
  recentActivity: Activity[];
  upcomingContracts: UpcomingContract[];
}

/**
 * Servicio para obtener datos del dashboard
 */
export const DashboardService = {
  /**
   * Obtiene todas las estadísticas del dashboard
   */
  getDashboardStats: () => 
    api.get<DashboardStats>('/dashboard/stats'),
  
  /**
   * Obtiene actividades recientes
   */
  getRecentActivity: (limit: number = 5) => 
    api.get<Activity[]>('/dashboard/activity', { 
      params: { limit } 
    }),
  
  /**
   * Obtiene contratos próximos a vencer
   */
  getUpcomingContracts: (limit: number = 5) => 
    api.get<UpcomingContract[]>('/dashboard/upcoming-contracts', { 
      params: { limit } 
    }),
  
  /**
   * Obtiene estadísticas de contratos para gráficos
   */
  getContractStats: (period: 'month' | 'year' = 'month') => 
    api.get<ContractStats>('/dashboard/contract-stats', { 
      params: { period } 
    }),
  
  /**
   * Obtiene estadísticas públicas (versión limitada para usuarios no autenticados)
   */
  getPublicStats: () => 
    api.get<Partial<DashboardStats>>('/dashboard/public-stats'),
}; 