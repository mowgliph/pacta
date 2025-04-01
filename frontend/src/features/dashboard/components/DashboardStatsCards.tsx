import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  IconFileInvoice, 
  IconUsers, 
  IconCalendarEvent, 
  IconAlertCircle,
  IconArrowUpRight,
  IconArrowDownRight,
  IconLock
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  percentage?: string;
  className?: string;
  isPublic?: boolean;
  onRequireAuth?: () => void;
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  percentage,
  className = '',
  isPublic,
  onRequireAuth
}) => {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="rounded-full bg-muted p-2 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend === 'up' ? (
            <IconArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
          ) : trend === 'down' ? (
            <IconArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />
          ) : null}
          {percentage && (
            <span className={
              trend === 'up' 
                ? 'text-emerald-500' 
                : trend === 'down' 
                  ? 'text-rose-500' 
                  : ''
            }>
              {percentage}
            </span>
          )}
          <span className="ml-1">{description}</span>
        </div>
        
        {isPublic && onRequireAuth && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-3 w-full justify-between text-xs"
            onClick={onRequireAuth}
          >
            <span>Ver detalles</span>
            <IconLock className="h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsCardsProps {
  activeContracts: number;
  pendingRenewals: number;
  totalUsers: number;
  alerts: number;
  isLoading?: boolean;
  isPublic?: boolean;
  onRequireAuth?: () => void;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({
  activeContracts,
  pendingRenewals,
  totalUsers,
  alerts,
  isLoading = false,
  isPublic = false,
  onRequireAuth,
}) => {
  // Si está cargando, mostrar un esqueleto de carga
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden opacity-40">
            <CardHeader className="animate-pulse flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-5 w-24 bg-muted rounded"></div>
              <div className="h-10 w-10 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2"></div>
              <div className="h-4 w-36 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Definimos las tarjetas de estadísticas
  const stats = [
    {
      title: 'Contratos Activos',
      value: activeContracts,
      description: `${pendingRenewals} próximos a vencer`,
      icon: <IconFileInvoice className="h-5 w-5" />,
      trend: pendingRenewals > 0 ? 'up' : 'neutral',
      percentage: pendingRenewals > 0 ? `${Math.round((pendingRenewals / activeContracts) * 100)}%` : undefined,
    },
    {
      title: 'Usuarios',
      value: totalUsers,
      description: 'Usuarios registrados',
      icon: <IconUsers className="h-5 w-5" />,
      trend: 'up',
      percentage: '8%',
    },
    {
      title: 'Próximos Eventos',
      value: pendingRenewals,
      description: 'Renovaciones pendientes',
      icon: <IconCalendarEvent className="h-5 w-5" />,
      trend: pendingRenewals > 3 ? 'down' : 'neutral',
      percentage: pendingRenewals > 3 ? '5%' : undefined,
    },
    {
      title: 'Alertas',
      value: alerts,
      description: 'Requieren atención',
      icon: <IconAlertCircle className="h-5 w-5" />,
      trend: alerts > 0 ? 'down' : 'neutral',
      percentage: alerts > 0 ? `${Math.round((alerts / activeContracts) * 100)}%` : undefined,
    },
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          isPublic={isPublic}
          onRequireAuth={onRequireAuth}
          className="transform transition-transform hover:scale-102 hover:-translate-y-1"
        />
      ))}
    </div>
  );
}; 