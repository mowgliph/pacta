import { useGet } from '@/lib/api/swr-hooks';
import { StatisticsService } from '../services/statisticsService';
import { 
  SpecificStats, 
  UserMetrics, 
  StatisticsChartData,
  ContractTypeStatistics,
  ContractStatusStatistics
} from '../types';

/**
 * Tipos de estadísticas específicas disponibles
 */
export type StatisticsType = 
  | 'contract' 
  | 'user' 
  | 'activity' 
  | 'company' 
  | 'client-contract' 
  | 'provider-contract' 
  | 'expired-contract' 
  | 'supplement-contract' 
  | 'new-contract';

/**
 * Hook para obtener estadísticas específicas según el tipo
 */
export function useSpecificStats(type: StatisticsType) {
  return useGet<SpecificStats>(`/statistics/${type}`, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener métricas específicas del usuario actual
 */
export function useUserMetrics() {
  return useGet<UserMetrics>('/statistics/user-metrics', {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener estadísticas de contratos por tipo
 */
export function useContractTypeStats() {
  return useGet<Record<string, number>>('/statistics/contract-types', {
    revalidateOnFocus: false,
    dedupingInterval: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para obtener estadísticas de contratos por estado
 */
export function useContractStatusStats() {
  return useGet<Record<string, number>>('/statistics/contract-status', {
    revalidateOnFocus: false,
    dedupingInterval: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para obtener estadísticas de contratos por mes
 */
export function useContractMonthlyStats(months = 12) {
  return useGet<Array<{month: string, count: number}>>(`/statistics/contracts-by-month?months=${months}`, {
    revalidateOnFocus: false,
    dedupingInterval: 24 * 60 * 60 * 1000, // 24 horas
  });
}

/**
 * Hook para obtener estadísticas de actividad
 */
export function useActivityStats(days = 30) {
  return useGet<{
    byDate: Array<{date: string, count: number}>;
    byType: Record<string, number>;
    byUser: Record<string, number>;
  }>(`/statistics/activity?days=${days}`, {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000, // 1 hora
  });
}

/**
 * Hook para obtener estadísticas de empresas
 */
export function useCompanyStats() {
  return useGet<{
    byCompany: Record<string, number>;
    byCompanyType: Record<string, number>;
    companiesPerMonth: Array<{month: string, count: number}>;
  }>('/statistics/companies', {
    revalidateOnFocus: false,
    dedupingInterval: 24 * 60 * 60 * 1000, // 24 horas
  });
}

/**
 * Hook para obtener estadísticas de contratos de clientes
 */
export function useClientContractStats() {
  return useGet<{
    byStatus: Record<string, number>;
    byClientContract: Record<string, number>;
    byMonth: Array<{month: string, count: number}>;
  }>('/statistics/client-contracts', {
    revalidateOnFocus: false,
    dedupingInterval: 12 * 60 * 60 * 1000, // 12 horas
  });
}

/**
 * Hook para obtener estadísticas de contratos de proveedores
 */
export function useProviderContractStats() {
  return useGet<{
    byStatus: Record<string, number>;
    byProviderContract: Record<string, number>;
    byMonth: Array<{month: string, count: number}>;
  }>('/statistics/provider-contracts', {
    revalidateOnFocus: false,
    dedupingInterval: 12 * 60 * 60 * 1000, // 12 horas
  });
}

/**
 * Hook para obtener estadísticas de contratos expirados
 */
export function useExpiredContractStats() {
  return useGet<{
    expiredContracts: Array<{month: string, count: number}>;
    expiredByType: Record<string, number>;
    byStatus: Record<string, number>;
  }>('/statistics/expired-contracts', {
    revalidateOnFocus: false,
    dedupingInterval: 12 * 60 * 60 * 1000, // 12 horas
  });
}

/**
 * Hook para obtener estadísticas de suplementos de contratos
 */
export function useSupplementStats() {
  return useGet<{
    withSupplements: number;
    withoutSupplements: number;
    supplementsByMonth: Array<{month: string, count: number}>;
    supplementsByType: Record<string, number>;
  }>('/statistics/supplements', {
    revalidateOnFocus: false,
    dedupingInterval: 12 * 60 * 60 * 1000, // 12 horas
  });
}

/**
 * Hook para obtener estadísticas de nuevos contratos
 */
export function useNewContractStats() {
  return useGet<{
    newContractsByMonth: Array<{month: string, count: number}>;
    newContractsByType: Record<string, number>;
    newContractsTrend: Array<{year: number, month: string, count: number}>;
  }>('/statistics/new-contracts', {
    revalidateOnFocus: false,
    dedupingInterval: 6 * 60 * 60 * 1000, // 6 horas
  });
}

/**
 * Hook para obtener estadísticas del dashboard
 */
export function useDashboardStats() {
  return useGet<{
    activeContracts: number;
    pendingRenewals: number;
    totalUsers: number;
    alerts: number;
  }>('/statistics/dashboard', {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutos
  });
} 