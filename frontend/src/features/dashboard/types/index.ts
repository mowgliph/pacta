/**
 * Tipos para el módulo de dashboard
 */

export interface DashboardStats {
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

export interface Activity {
  id: string;
  type: 'contract_created' | 'contract_updated' | 'contract_expired' | 'supplement_added';
  targetId: string;
  targetName: string;
  user: string;
  date: string;
  description: string;
  // Propiedades adicionales del servicio
  title?: string;
  timestamp?: string;
  userId?: string;
  userAvatar?: string;
  userName?: string;
}

export interface Contract {
  id: string;
  name: string;
  contractNumber: string;
  companyName: string;
  type: 'client' | 'provider';
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
}

/**
 * Tipo para contratos próximos a vencer
 */
export interface UpcomingContract {
  id: string;
  name: string;
  company: string;
  expirationDate: string;
  daysRemaining: number;
  status: 'active' | 'pending' | 'expired';
}

/**
 * Tipo para estadísticas de contratos
 */
export interface ContractStats {
  labels: string[];
  data: number[];
}

/**
 * Tipos para estadísticas específicas
 */
export interface SpecificStats {
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

/**
 * Tipo para las métricas de usuario
 */
export interface UserMetrics {
  contractsCreated: number;
  contractsUpdated: number;
  documentsUploaded: number;
  lastActivity: string;
} 