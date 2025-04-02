// Exportación de componentes principales de estadísticas
export { StatisticsPage } from './pages/StatisticsPage';
export { StatisticsOverviewCard } from './components/StatisticsOverviewCard';
export { StatisticsChartCard } from './components/StatisticsChartCard';
export { ContractAnalytics } from './components/ContractAnalytics';
export { ActivityAnalytics } from './components/ActivityAnalytics';

// Exportación de componentes específicos para estadísticas de contratos
export { CompanyStatistics } from './components/CompanyStatistics';
export { ClientContractStatistics } from './components/ClientContractStatistics';
export { ProviderContractStatistics } from './components/ProviderContractStatistics';
export { ExpiredContractStatistics } from './components/ExpiredContractStatistics';
export { SupplementContractStatistics } from './components/SupplementContractStatistics';
export { NewContractStatistics } from './components/NewContractStatistics';

// Re-exportación de servicios del dashboard para estadísticas
export {
  DashboardService,
  type SpecificStats,
  type UserMetrics
} from '../dashboard/services/dashboard-service';

// Exportación de servicios de estadísticas
export { StatisticsService } from './services/statisticsService';
export { StatisticsMockService } from './services/statisticsMockService';

// Re-exportación de hooks para acceso a datos
export {
  useSpecificStats,
  useUserMetrics,
  useContractTypeStats,
  useContractStatusStats,
  useContractMonthlyStats,
  useActivityStats,
  useCompanyStats,
  useClientContractStats,
  useProviderContractStats,
  useExpiredContractStats,
  useSupplementStats,
  useNewContractStats,
  type StatisticsType
} from './hooks/useStatistics';

// Esta estructura permite importar componentes y servicios directamente 
// desde el módulo de estadísticas.
// Ejemplo: import { StatisticsPage, useSpecificStats } from '@/features/statistics'; 