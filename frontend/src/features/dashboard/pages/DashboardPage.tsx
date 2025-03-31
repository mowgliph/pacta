import React, { useEffect } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  IconUsers, 
  IconFileInvoice, 
  IconCalendarEvent, 
  IconAlertCircle,
  IconTrendingUp,
  IconArrowUpRight,
  IconArrowDownRight,
  IconRefresh
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';

export const DashboardPage: React.FC = () => {
  const { user } = useStore(state => ({ 
    user: state.user
  }));
  const { showSuccess, showInfo, showWarning, showError } = useNotifications();

  // Datos de ejemplo para el dashboard
  const stats = [
    { 
      title: 'Contratos Activos', 
      value: '14', 
      description: '3 próximos a vencer', 
      icon: <IconFileInvoice className="h-5 w-5" />,
      trend: 'up',
      percentage: '12%'
    },
    { 
      title: 'Usuarios', 
      value: '28', 
      description: '4 nuevos este mes', 
      icon: <IconUsers className="h-5 w-5" />,
      trend: 'up',
      percentage: '8%'
    },
    { 
      title: 'Próximos Eventos', 
      value: '6', 
      description: 'Renovaciones pendientes', 
      icon: <IconCalendarEvent className="h-5 w-5" />,
      trend: 'down',
      percentage: '5%'
    },
    { 
      title: 'Alertas', 
      value: '2', 
      description: 'Requieren atención', 
      icon: <IconAlertCircle className="h-5 w-5" />,
      trend: 'down',
      percentage: '25%'
    }
  ];

  // Ejemplo: Mostrar una notificación de bienvenida al cargar el dashboard
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
  
  // Función para simular una actualización de datos
  const handleRefreshData = () => {
    showInfo('Actualizando datos...', 'Espere un momento mientras recargamos la información');
    
    // Simular un proceso de actualización que toma tiempo
    setTimeout(() => {
      showSuccess('Datos actualizados', 'La información ha sido actualizada correctamente');
    }, 2000);
  };
  
  // Función para mostrar diferentes tipos de notificaciones
  const handleTestNotifications = () => {
    showInfo('Información', 'Este es un mensaje informativo');
    
    setTimeout(() => {
      showSuccess('Éxito', 'Operación completada correctamente');
    }, 1000);
    
    setTimeout(() => {
      showWarning('Advertencia', 'Tenga cuidado con esta acción');
    }, 2000);
    
    setTimeout(() => {
      showError('Error', 'Ha ocurrido un problema al procesar la solicitud');
    }, 3000);
  };

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
          >
            <IconRefresh className="h-4 w-4" />
            <span>Actualizar</span>
          </Button>
        }
      />

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="rounded-full bg-muted p-2 text-primary">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === 'up' ? (
                  <IconArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                ) : (
                  <IconArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />
                )}
                <span className={stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>
                  {stat.percentage}
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sección de actividad reciente */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
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
                  <div className="rounded-full bg-primary/10 p-2">
                    <IconTrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {['Contrato actualizado', 'Usuario nuevo', 'Renovación programada', 'Alerta resuelta', 'Documento cargado'][i]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace {[2, 5, 12, 18, 24][i]} horas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Contratos por Vencer</CardTitle>
            <CardDescription>
              Contratos que requieren renovación próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 border-b pb-3 last:border-0">
                  <div className={`h-2 w-2 rounded-full ${['bg-red-500', 'bg-yellow-500', 'bg-green-500'][i]}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        Contrato #{[1005, 1002, 1008][i]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {['5 días', '2 semanas', '1 mes'][i]}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {['Cliente A', 'Cliente B', 'Cliente C'][i]} - {['Servicios', 'Mantenimiento', 'Licencias'][i]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de prueba de notificaciones */}
      <div className="col-span-full">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Probar Sistema de Notificaciones</h3>
          <p className="text-muted-foreground mb-4">
            Haga clic en el botón de abajo para probar los diferentes tipos de notificaciones.
          </p>
          <Button onClick={handleTestNotifications}>
            Mostrar notificaciones
          </Button>
        </div>
      </div>
    </div>
  );
}; 