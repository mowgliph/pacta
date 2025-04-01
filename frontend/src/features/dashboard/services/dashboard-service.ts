import { api } from '@/lib/api';

// Tipos para las actividades recientes
export type Activity = {
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
export type UpcomingContract = {
  id: string;
  name: string;
  company: string;
  expirationDate: string;
  daysRemaining: number;
  status: 'active' | 'pending' | 'expired';
}

// Tipo para estadísticas de contratos
export type ContractStats = {
  labels: string[];
  data: number[];
}

// Tipo para las estadísticas del dashboard
export type DashboardStats = {
  activeContracts: number;
  pendingRenewals: number;
  totalUsers: number;
  alerts: number;
  contractsStats: ContractStats;
  recentActivity: Activity[];
  upcomingContracts: UpcomingContract[];
}

// Tipo para las estadísticas específicas
export type SpecificStats = {
  // Propiedades comunes
  lastUpdated?: string;
  
  // Propiedades para estadísticas de contratos
  byStatus?: Record<string, number>;
  byType?: Record<string, number>;
  byMonth?: Array<{month: string; count: number}>;
  
  // Propiedades para estadísticas de usuarios
  byRole?: Record<string, number>;
  active?: number;
  inactive?: number;
  
  // Propiedades para estadísticas de actividad
  byDate?: Array<{date: string; count: number}>;
  byUser?: Record<string, number>;
  
  // Propiedades para estadísticas de empresas
  byCompany?: Record<string, number>;
  byCompanyType?: Record<string, number>;
  companiesPerMonth?: Array<{month: string; count: number}>;
  
  // Propiedades para estadísticas de contratos por categoría
  byClientContract?: Record<string, number>;
  byProviderContract?: Record<string, number>;
  
  // Propiedades para estadísticas de contratos vencidos
  expiredContracts?: Array<{month: string; count: number}>;
  expiredByType?: Record<string, number>;
  
  // Propiedades para estadísticas de contratos modificados
  withSupplements?: number;
  withoutSupplements?: number;
  supplementsByMonth?: Array<{month: string; count: number}>;
  supplementsByType?: Record<string, number>;
  
  // Propiedades para estadísticas de nuevos contratos
  newContractsByMonth?: Array<{month: string; count: number}>;
  newContractsByType?: Record<string, number>;
  newContractsTrend?: Array<{year: number; month: string; count: number}>;
}

// Tipo para las métricas de usuario
export type UserMetrics = {
  contractsCreated: number;
  contractsUpdated: number;
  documentsUploaded: number;
  lastActivity: string;
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