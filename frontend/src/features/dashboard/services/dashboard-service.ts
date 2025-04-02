import { api } from '@/lib/api';
import { 
  Activity, 
  DashboardStats, 
  SpecificStats, 
  UserMetrics,
  Contract,
  UpcomingContract,
  ContractStats
} from '../types';

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

  /**
   * Obtiene resumen general para el dashboard
   */
  getOverview: (startDate?: string, endDate?: string) => 
    api.get('/dashboard/overview', { 
      params: { startDate, endDate } 
    }),

  /**
   * Obtiene métricas específicas del usuario actual
   */
  getUserMetrics: () => 
    api.get<UserMetrics>('/dashboard/user-metrics'),

  /**
   * Obtiene estadísticas específicas para análisis detallado
   */
  getSpecificStats: (type: 'contract' | 'user' | 'activity' | 'company' | 'client-contract' | 'provider-contract' | 'expired-contract' | 'supplement-contract' | 'new-contract') => 
    api.get<SpecificStats>(`/analytics/${type}-stats`),
}; 