import { useAuth } from '@/contexts/AuthContext';
import { Users, FileText, FileCheck, Clock, AlertTriangle, Activity, Users as UsersIcon, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useDashboardStats } from '@/lib/useDashboardStats';

// Función para mapear el tipo de actividad a un tipo compatible con ActivityFeed
const mapActivityType = (type: 'new' | 'updated' | 'expired'): 'contract' | 'supplement' | 'login' | 'system' => {
  switch (type) {
    case 'new':
      return 'contract';
    case 'updated':
      return 'supplement';
    case 'expired':
      return 'system';
    default:
      return 'system';
  }
};

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const { data: stats, loading, error } = useDashboardStats();
  
  // Mapear las actividades recientes al formato esperado por ActivityFeed
  const recentActivities = stats.recentActivity.map(activity => ({
    id: activity.id,
    type: mapActivityType(activity.type),
    title: activity.name,
    description: activity.description,
    timestamp: new Date(activity.date),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-medio"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error al cargar las estadísticas del dashboard: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {hasRole(['admin']) ? 'Panel de Administración' : 'Mi Panel'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {hasRole(['admin']) 
              ? 'Resumen general y estadísticas del sistema' 
              : 'Actividad reciente y acceso rápido a tus herramientas'}
          </p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Contratos Totales"
          value={stats.totals.total}
          icon={FileText}
        />
        
        <StatCard
          title="Contratos Activos"
          value={stats.totals.active}
          icon={FileCheck}
          className={stats.totals.expiring > 0 ? 'ring-2 ring-yellow-200' : ''}
        />

        <StatCard
          title="Por Vencer"
          value={stats.totals.expiring}
          icon={AlertTriangle}
          className={stats.totals.expiring > 0 ? 'ring-2 ring-yellow-200' : ''}
        />

        <StatCard
          title="Distribución"
          value={stats.distribution.client + stats.distribution.supplier}
          icon={UsersIcon}
          description={`${stats.distribution.client} Clientes / ${stats.distribution.supplier} Proveedores`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad Reciente */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={recentActivities} />
        </div>

        {/* Acciones Rápidas */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
