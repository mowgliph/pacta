import { api } from '@/lib/api';
import { SpecificStats, UserMetrics } from '../types';
import { StatisticsMockService } from './statisticsMockService';
import { StatisticsType } from '../hooks/useStatistics';

// Verificar si debe usar datos mock o reales
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Servicio para obtener datos de estadísticas 
// Actúa como un adaptador que puede usar datos reales o mock
export const StatisticsService = {
  /**
   * Obtiene estadísticas específicas según el tipo solicitado
   */
  getSpecificStats: async (type: StatisticsType): Promise<SpecificStats> => {
    if (USE_MOCK_DATA) {
      // Simulamos un delay para emular una llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      return StatisticsMockService.getSpecificStats(type);
    }
    
    // Implementación real usando SWR
    return api.get<SpecificStats>(`/statistics/${type}`);
  },

  /**
   * Obtiene métricas específicas del usuario actual
   */
  getUserMetrics: async (): Promise<UserMetrics> => {
    if (USE_MOCK_DATA) {
      // Simulamos un delay para emular una llamada API
      await new Promise(resolve => setTimeout(resolve, 300));
      return StatisticsMockService.getUserMetrics();
    }
    
    // Implementación real usando SWR
    return api.get<UserMetrics>('/statistics/user-metrics');
  },

  /**
   * Obtiene estadísticas de contratos por tipo
   */
  getContractTypeStats: async (): Promise<Record<string, number>> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = await StatisticsMockService.getSpecificStats('contract');
      return data.byType || {};
    }
    
    return api.get<Record<string, number>>('/statistics/contract-types');
  },

  /**
   * Obtiene estadísticas de contratos por estado
   */
  getContractStatusStats: async (): Promise<Record<string, number>> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = await StatisticsMockService.getSpecificStats('contract');
      return data.byStatus || {};
    }
    
    return api.get<Record<string, number>>('/statistics/contract-status');
  },

  /**
   * Obtiene estadísticas de contratos por mes
   */
  getContractMonthlyStats: async (months = 12): Promise<Array<{month: string, count: number}>> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const data = await StatisticsMockService.getSpecificStats('contract');
      return data.byMonth || [];
    }
    
    return api.get<Array<{month: string, count: number}>>(`/statistics/contracts-by-month?months=${months}`);
  }
}; 