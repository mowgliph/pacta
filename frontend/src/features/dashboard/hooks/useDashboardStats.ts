import { useGet } from '@/lib/api/swr-hooks';
import { DashboardService } from '../services/dashboard-service';
import { createSWRKey } from '@/lib/api/swrConfig';
import { StatisticsService } from '../../statistics/services/statisticsService';
import { 
  DashboardStats, 
  Activity, 
  Contract, 
  SpecificStats, 
  UserMetrics 
} from '../types';

/**
 * Hook para obtener las estadísticas del dashboard
 */
export function useDashboardStats() {
  return useGet<DashboardStats>('/dashboard/stats', {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener los contratos que expiran pronto
 */
export function useExpiringContracts(days = 30, limit = 5) {
  return useGet<Contract[]>(`/dashboard/expiring-contracts?days=${days}&limit=${limit}`, {
    revalidateOnFocus: false,
    dedupingInterval: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener la actividad reciente
 */
export function useRecentActivity(limit = 10) {
  return useGet<Activity[]>(`/dashboard/activity?limit=${limit}`, {
    revalidateOnFocus: true,
    dedupingInterval: 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener estadísticas de contratos por tipo (cliente/proveedor)
 */
export function useContractsByType() {
  return useGet<{client: number, provider: number}>('/dashboard/contracts-by-type', {
    revalidateOnFocus: false,
    dedupingInterval: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para obtener estadísticas de contratos por estado
 */
export function useContractsByStatus() {
  return useGet<{active: number, pending: number, expired: number, cancelled: number}>('/dashboard/contracts-by-status', {
    revalidateOnFocus: false,
    dedupingInterval: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para obtener estadísticas de contratos por mes
 */
export function useContractsByMonth(months = 6) {
  return useGet<{month: string, count: number}[]>(`/dashboard/contracts-by-month?months=${months}`, {
    revalidateOnFocus: false, 
    dedupingInterval: 24 * 60 * 60 * 1000, // 24 horas
  });
}

/**
 * Hook para obtener contratos próximos a vencer
 */
export function useUpcomingContracts(limit = 5) {
  return useGet<Contract[]>(`/dashboard/upcoming-contracts?limit=${limit}`, {
    revalidateOnFocus: false,
    dedupingInterval: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener estadísticas generales de contratos
 */
export function useContractStats() {
  return useGet<{
    total: number;
    active: number;
    expiring: number;
    expired: number;
  }>('/dashboard/contract-stats', {
    revalidateOnFocus: false,
    dedupingInterval: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para obtener estadísticas de suplementos
 */
export function useSupplementStats() {
  return useGet<{
    total: number;
    byMonth: {
      month: string;
      count: number;
    }[];
  }>('/dashboard/supplement-stats', {
    revalidateOnFocus: false,
    dedupingInterval: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para obtener estadísticas específicas según el tipo
 * @param type El tipo de estadísticas a obtener
 */
export const useSpecificStats = (type: 'contract' | 'user' | 'activity' | 'company' | 'client-contract' | 'provider-contract' | 'expired-contract' | 'supplement-contract' | 'new-contract') => {
  return useGet<SpecificStats>(`/dashboard/specific-stats/${type}`, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener métricas específicas del usuario actual
 */
export const useUserMetrics = () => {
  return useGet<UserMetrics>('/dashboard/user-metrics', {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutos
  });
}; 