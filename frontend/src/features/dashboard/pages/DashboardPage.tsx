import React, { useEffect } from 'react';
import { useStore } from '@/store';
import { 
  IconRefresh, 
  IconArrowRight 
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { DashboardStatsCards } from '../components/DashboardStatsCards';
import { RecentActivityCard } from '../components/RecentActivityCard';
import { UpcomingContractsCard } from '../components/UpcomingContractsCard';
import { DashboardChart } from '../components/DashboardChart';
import { DashboardContractsChart } from '../components/DashboardContractsChart';
import { QuickActions } from '../components/QuickActions';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { Link } from 'react-router-dom';
import { useContractStatsByType } from '@/features/contracts/hooks/useContracts';

export default function DashboardPage() {
  const { user } = useStore(state => ({ 
    user: state.user
  }));
  const { showSuccess, showInfo, showError } = useNotifications();
  
  // Obtener datos del dashboard usando SWR
  const { 
    data: dashboardStats, 
    isLoading: isLoadingStats, 
    error,
    mutate 
  } = useDashboardStats();

  // Obtener estadísticas de contratos por tipo
  const { 
    data: contractTypeStats, 
    isLoading: isLoadingContractTypes 
  } = useContractStatsByType();

  // Mostrar notificación de bienvenida
  useEffect(() => {
    const timer = setTimeout(() => {
      showSuccess(
        '¡Bienvenido a PACTA!',
        `Sesión iniciada como ${user?.firstName || ''} ${user?.lastName || ''}`,
        { duration: 5000 }
      );
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [showSuccess, user]);
  
  // Función para actualizar los datos con SWR
  const handleRefreshData = async () => {
    showInfo('Actualizando datos...', 'Espere un momento mientras recargamos la información');
    
    try {
      // Con SWR se usa mutate para revalidar datos en vez de refetch
      await mutate(); 
      showSuccess('Datos actualizados', 'La información ha sido actualizada correctamente');
    } catch (_error) {
      showError('Error al actualizar', 'No se pudieron obtener los datos más recientes');
    }
  };

  // Combinar datos de carga
  const isLoading = isLoadingStats || isLoadingContractTypes;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`¡Bienvenido, ${user?.firstName || 'Usuario'}!`}
        description="Panel de control principal"
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData}
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
          </Button>
        }
      />

      {/* Acciones Rápidas */}
      <QuickActions />

      {/* Tarjetas de estadísticas */}
      <DashboardStatsCards 
        activeContracts={dashboardStats?.activeContracts || 0}
        pendingRenewals={dashboardStats?.pendingRenewals || 0}
        totalUsers={dashboardStats?.totalUsers || 0}
        alerts={dashboardStats?.alerts || 0}
        isLoading={isLoading}
      />

      {/* Gráfico de contratos */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
        <DashboardChart 
          title="Contratos por mes"
          description="Evolución de contratos en los últimos meses"
          data={dashboardStats?.contractsStats || { labels: [], data: [] }}
          isLoading={isLoading}
          className="col-span-4 lg:col-span-3"
        />
        
        <DashboardContractsChart
          title="Tipos de contratos"
          description="Distribución por categoría"
          data={contractTypeStats || { client: 0, provider: 0 }}
          isLoading={isLoading}
          className="col-span-4 lg:col-span-1"
        />
      </div>

      {/* Sección de actividad reciente y contratos por vencer */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RecentActivityCard 
            activities={dashboardStats?.recentActivity?.map(activity => ({
              id: activity.id,
              type: activity.type,
              description: activity.description,
              timestamp: activity.timestamp
            })) || []}
            isLoading={isLoading}
          />
        </div>
        
        <div className="col-span-3">
          <UpcomingContractsCard 
            contracts={dashboardStats?.upcomingContracts || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Botón de acceso rápido a estadísticas completas */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          asChild
        >
          <Link to="/statistics">
            Ver estadísticas completas <IconArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 