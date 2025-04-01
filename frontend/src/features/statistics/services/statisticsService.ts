import { type SpecificStats, UserMetrics } from '../../dashboard/services/dashboard-service';
import { StatisticsMockService } from './statisticsMockService';

// Verificar si debe usar datos mock o reales
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Servicio para obtener datos de estadísticas 
// Actúa como un adaptador que puede usar datos reales o mock
export const StatisticsService = {
  /**
   * Obtiene estadísticas específicas según el tipo solicitado
   */
  getSpecificStats: async (type: string): Promise<SpecificStats> => {
    if (USE_MOCK_DATA) {
      // Simulamos un delay para emular una llamada API
      await new Promise(resolve => setTimeout(resolve, 500));
      return StatisticsMockService.getSpecificStats(type);
    }
    
    // Para implementación real, se podría llamar directamente al DashboardService
    // Aquí se podría añadir lógica adicional como transformación de datos o caching
    throw new Error("API real aún no implementada");
  },
}; 