import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, DashboardStats } from '../services/dashboardApi';

/**
 * Hook para obtener y gestionar las estadísticas del dashboard
 * @returns Query que contiene las estadísticas del dashboard
 */
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}; 