import { useState, useCallback, useEffect } from 'react';
import { DashboardService } from '../services/dashboard-service';
import { DashboardStats } from '../types';

/**
 * Hook para obtener las estadísticas del dashboard
 */
export function useDashboardStats() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Función para cargar los datos
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stats = await DashboardService.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Función para actualizar los datos
  const mutate = useCallback(() => {
    return fetchData();
  }, [fetchData]);
  
  // Efecto para cargar los datos iniciales
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { data: dashboardStats, isLoading, error, mutate };
} 