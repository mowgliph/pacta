import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticsChartCard } from './StatisticsChartCard';
import { useSpecificStats } from '../hooks/useStatistics';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconCalendar, IconFilter } from '@tabler/icons-react';

export function ActivityAnalytics() {
  const { data: activityStats, isLoading, mutate } = useSpecificStats('activity');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activityType, setActivityType] = useState<string>('all');
  
  // Datos para gráfico de actividad por fecha
  const activityData = useMemo(() => {
    if (!activityStats?.byDate) return [];
    
    return activityStats.byDate.map((item: any) => ({
      name: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      actividades: item.count,
    }));
  }, [activityStats]);
  
  // Datos para gráfico de actividad por tipo
  const activityByTypeData = useMemo(() => {
    if (!activityStats?.byType) return [];
    
    return Object.entries(activityStats.byType as Record<string, number>).map(([type, count]) => ({
      name: formatActivityType(type),
      valor: count,
    }));
  }, [activityStats]);
  
  // Función para formatear el tipo de actividad
  function formatActivityType(type: string): string {
    const types: Record<string, string> = {
      contract_created: 'Crear contrato',
      contract_updated: 'Actualizar contrato',
      user_login: 'Inicio sesión',
      document_upload: 'Subir documento',
      payment_processed: 'Procesar pago',
    };
    
    return types[type] || type;
  }
  
  // Función para obtener color según tipo de actividad
  function getActivityTypeColor(type: string): string {
    const colors: Record<string, string> = {
      contract_created: '#3b82f6', // azul
      contract_updated: '#8b5cf6', // violeta
      user_login: '#22c55e', // verde
      document_upload: '#f59e0b', // amarillo
      payment_processed: '#ec4899', // rosa
    };
    
    return colors[type] || '#64748b';
  }
  
  // Actualizar filtros y refrescar datos
  const applyFilters = () => {
    mutate();
  };
  
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de actividad</CardTitle>
          <CardDescription>
            Filtra las actividades por fecha y tipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                initialFocus
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de actividad</label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las actividades</SelectItem>
                    <SelectItem value="contract_created">Creación de contratos</SelectItem>
                    <SelectItem value="contract_updated">Actualización de contratos</SelectItem>
                    <SelectItem value="user_login">Inicios de sesión</SelectItem>
                    <SelectItem value="document_upload">Subida de documentos</SelectItem>
                    <SelectItem value="payment_processed">Procesamiento de pagos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={applyFilters} className="w-full mt-auto">
                Aplicar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Gráficos de actividad */}
      <div className="grid gap-6 md:grid-cols-1">
        {/* Actividad por fecha */}
        <StatisticsChartCard
          title="Actividad por fecha"
          description="Número de actividades registradas por día"
          data={activityData}
          isLoading={isLoading}
          xAxisKey="name"
          lines={[
            { dataKey: 'actividades', name: 'Actividades', color: '#14b8a6' },
          ]}
          bars={[
            { dataKey: 'actividades', name: 'Actividades', color: '#14b8a6' },
          ]}
        />
        
        {/* Actividad por tipo */}
        <StatisticsChartCard
          title="Actividad por tipo"
          description="Distribución de actividades según su tipo"
          data={activityByTypeData}
          isLoading={isLoading}
          xAxisKey="name"
          bars={activityByTypeData.map((item, index) => ({
            dataKey: 'valor',
            name: item.name,
            color: getActivityTypeColor(Object.keys(activityStats?.byType || {})[index] || ''),
          }))}
        />
      </div>
    </div>
  );
} 