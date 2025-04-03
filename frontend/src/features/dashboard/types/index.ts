/**
 * Tipos para el módulo de dashboard
 */

export type DashboardStats = {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  totalValue: number;
  recentActivity: Activity[];
  contractsByType: {
    client: number;
    provider: number;
  };
  contractsByStatus: {
    active: number;
    pending: number;
    expired: number;
    cancelled: number;
  };
  contractsByMonth: {
    month: string;
    count: number;
  }[];
  // Propiedades adicionales del servicio
  pendingRenewals?: number;
  totalUsers?: number;
  alerts?: number;
  contractsStats?: ContractStats;
  upcomingContracts?: UpcomingContract[];
}

/**
 * Tipo para actividad reciente
 */
export type Activity = {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  userId?: string;
  objectId?: string;
  objectType?: string;
}

/**
 * Tipo para contrato próximo a vencer
 */
export type UpcomingContract = {
  id: string;
  contractNumber: string;
  company: string;
  type: string;
  daysUntilExpiry: number;
}

/**
 * Tipo para estadísticas específicas
 */
export type SpecificStats = {
  title: string;
  data: any;
  summary?: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  timeframe?: string;
}

/**
 * Tipo para métricas de usuario
 */
export type UserMetrics = {
  createdContracts: number;
  completedTasks: number;
  pendingTasks: number;
  lastLogin: string;
}

/**
 * Tipo para estadísticas de contratos
 */
export type ContractStats = {
  labels: string[];
  data: number[];
} 