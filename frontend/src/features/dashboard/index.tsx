// Re-exportaciones de los componentes del dashboard
export { DashboardPage } from './pages/DashboardPage';
export { DashboardPublicPage } from './pages/DashboardPublicPage';
export { DashboardStatsCards } from './components/DashboardStatsCards';
export { DashboardChart } from './components/DashboardChart';
export { QuickActionsPublic } from './components/QuickActionsPublic';
export { RecentActivityPublic } from './components/RecentActivityPublic';
export { QuickActions } from './components/QuickActions';
export { RecentActivityCard } from './components/RecentActivityCard';
export { UpcomingContractsCard } from './components/UpcomingContractsCard';
export { Overview } from './components/Overview';

// Exportación del servicio de dashboard
export {
  DashboardService,
  type DashboardStats,
  type Activity,
  type UpcomingContract,
  type ContractStats
} from './services/dashboard-service';

// Esta estructura permite importar los componentes directamente desde la feature
// Ejemplo: import { DashboardPage, DashboardService } from '@/features/dashboard';