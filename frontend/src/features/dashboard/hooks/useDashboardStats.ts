import { useQuery } from '@tanstack/react-query';
import { 
  DashboardService, 
  type DashboardStats, 
  type SpecificStats, 
  type UserMetrics 
} from '../services/dashboard-service';
import { StatisticsService } from '../../statistics/services/statisticsService';

/**
 * Hook para obtener las estadísticas generales del dashboard
 */
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await DashboardService.getDashboardStats();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener estadísticas específicas según el tipo
 * @param type El tipo de estadísticas a obtener
 */
export const useSpecificStats = (type: 'contract' | 'user' | 'activity' | 'company' | 'client-contract' | 'provider-contract' | 'expired-contract' | 'supplement-contract' | 'new-contract') => {
  return useQuery<SpecificStats>({
    queryKey: ['specificStats', type],
    queryFn: async () => {
      try {
        const response = await StatisticsService.getSpecificStats(type);
        return response;
      } catch (error) {
        console.error(`Error al obtener estadísticas de ${type}:`, error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener métricas específicas del usuario actual
 */
export const useUserMetrics = () => {
  return useQuery<UserMetrics>({
    queryKey: ['userMetrics'],
    queryFn: async () => {
      const response = await DashboardService.getUserMetrics();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener las actividades recientes
 */
export const useRecentActivity = (limit = 5) => {
  return useQuery({
    queryKey: ['recentActivity', limit],
    queryFn: () => DashboardService.getRecentActivity(limit),
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener contratos próximos a vencer
 */
export const useUpcomingContracts = (limit = 5) => {
  return useQuery({
    queryKey: ['upcomingContracts', limit],
    queryFn: () => DashboardService.getUpcomingContracts(limit),
    staleTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
  });
}; 