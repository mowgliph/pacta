import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  IconFileInvoice, 
  IconUserPlus, 
  IconCalendarEvent, 
  IconAlertCircle,
  IconFileUpload
} from '@tabler/icons-react';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface RecentActivityCardProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ 
  activities,
  isLoading = false 
}) => {
  // Función para obtener el icono según el tipo de actividad
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <IconFileInvoice className="h-4 w-4 text-primary" />;
      case 'new':
        return <IconUserPlus className="h-4 w-4 text-emerald-500" />;
      case 'renewal':
        return <IconCalendarEvent className="h-4 w-4 text-amber-500" />;
      case 'alert':
        return <IconAlertCircle className="h-4 w-4 text-rose-500" />;
      case 'document':
        return <IconFileUpload className="h-4 w-4 text-blue-500" />;
      default:
        return <IconFileInvoice className="h-4 w-4 text-primary" />;
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      // Si es hoy, mostrar "hace X horas/minutos"
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  // Si está cargando, mostrar esqueleto de carga
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones realizadas en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <div className="rounded-full bg-muted animate-pulse h-8 w-8"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>
          Últimas acciones realizadas en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center gap-4 border-b pb-4 last:border-0 transition-colors hover:bg-muted/30 p-2 rounded-md"
            >
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 