import { useQuery } from '@tanstack/react-query';
import { apiHelpers } from '../../../lib/api';

// Tipos
export type DashboardStats = {
  contractsCount: number;
  activeContractsCount: number;
  expiringContractsCount: number;
  expiredContractsCount: number;
  usersCount: number;
  companiesCount: number;
  recentActivity: Activity[];
}

export type ContractStats = {
  byStatus: {
    status: string;
    count: number;
  }[];
  byMonth: {
    month: string;
    count: number;
  }[];
  byCompany: {
    companyName: string;
    count: number;
  }[];
  byDepartment: {
    departmentName: string;
    count: number;
  }[];
}

export type UserStats = {
  byRole: {
    role: string;
    count: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
  byDepartment: {
    departmentName: string;
    count: number;
  }[];
  activityByMonth: {
    month: string;
    count: number;
  }[];
}

export type Activity = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details?: string;
  createdAt: string;
}

// Constantes
const STATISTICS_URL = '/statistics';
const STATISTICS_KEY = 'statistics';

export const useStatistics = () => {
  // Obtener estadísticas del dashboard
  const getDashboardStats = () => {
    return useQuery({
      queryKey: [STATISTICS_KEY, 'dashboard'],
      queryFn: () => apiHelpers.get<DashboardStats>(`${STATISTICS_URL}/dashboard`),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  // Obtener estadísticas de contratos
  const getContractStats = (timeRange: 'week' | 'month' | 'year' = 'month') => {
    return useQuery({
      queryKey: [STATISTICS_KEY, 'contracts', timeRange],
      queryFn: () => apiHelpers.get<ContractStats>(`${STATISTICS_URL}/contracts`, { timeRange }),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  // Obtener estadísticas de usuarios
  const getUserStats = (timeRange: 'week' | 'month' | 'year' = 'month') => {
    return useQuery({
      queryKey: [STATISTICS_KEY, 'users', timeRange],
      queryFn: () => apiHelpers.get<UserStats>(`${STATISTICS_URL}/users`, { timeRange }),
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  // Obtener actividades recientes
  const getRecentActivity = (limit: number = 10) => {
    return useQuery({
      queryKey: [STATISTICS_KEY, 'activity', limit],
      queryFn: () => apiHelpers.get<Activity[]>(`${STATISTICS_URL}/activity`, { limit }),
      staleTime: 1 * 60 * 1000, // 1 minuto
    });
  };

  return {
    getDashboardStats,
    getContractStats,
    getUserStats,
    getRecentActivity,
  };
}; 