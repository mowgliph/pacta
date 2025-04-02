import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticsChartCard } from './StatisticsChartCard';
import { useSpecificStats } from '../hooks/useStatistics';
import { Progress } from '@/components/ui/progress';

export function ContractAnalytics() {
  const { data: contractStats, isLoading } = useSpecificStats('contract');
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // Procesar datos para los gráficos
  const chartData = useMemo(() => {
    if (!contractStats || !contractStats.byMonth) {
      return [];
    }

    return contractStats.byMonth.map(item => ({
      name: item.month.substring(0, 3), // Abreviatura del mes
      contratos: item.count,
    }));
  }, [contractStats]);

  // Procesar datos para estadísticas por estado
  const statusData = useMemo(() => {
    if (!contractStats || !contractStats.byStatus) {
      return [];
    }

    const statuses = Object.entries(contractStats.byStatus).map(([key, value]) => ({
      name: key,
      value: value,
    }));

    // Calcular el total para los porcentajes
    const total = statuses.reduce((acc, curr) => acc + curr.value, 0);

    // Añadir porcentajes y colores
    return statuses.map(status => ({
      ...status,
      percentage: Math.round((status.value / total) * 100),
      color: getStatusColor(status.name),
    }));
  }, [contractStats]);

  // Función para determinar el color según el estado
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      ACTIVE: '#22c55e', // verde
      PENDING: '#f59e0b', // ambar
      EXPIRED: '#ef4444', // rojo
      DRAFT: '#94a3b8', // gris
      CANCELED: '#64748b', // gris oscuro
    };

    return colors[status] || '#cbd5e1';
  }

  return (
    <div className="space-y-6">
      {/* Gráfico principal */}
      <StatisticsChartCard
        title="Evolución de contratos"
        description="Contratos creados a lo largo del tiempo"
        data={chartData}
        isLoading={isLoading}
        xAxisKey="name"
        lines={[
          { dataKey: 'contratos', name: 'Contratos', color: '#3b82f6' },
        ]}
        bars={[
          { dataKey: 'contratos', name: 'Contratos', color: '#3b82f6' },
        ]}
        showSelect={true}
        selectOptions={[
          { value: 'month', label: 'Últimos 12 meses' },
          { value: 'year', label: 'Anual' },
        ]}
        onSelectChange={(value) => setTimeRange(value as 'month' | 'year')}
      />

      {/* Estadísticas por estado */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contratos por estado</CardTitle>
            <CardDescription>
              Distribución actual de contratos según su estado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {statusData.map((status) => (
                  <div key={status.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{status.name}</span>
                      <span className="font-medium">{status.value} ({status.percentage}%)</span>
                    </div>
                    <Progress value={status.percentage} className="h-2" style={{ backgroundColor: '#e2e8f0' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${status.percentage}%`, backgroundColor: status.color }}
                      />
                    </Progress>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Última actualización: {contractStats?.lastUpdated ? new Date(contractStats.lastUpdated).toLocaleString() : 'Cargando...'}
          </CardFooter>
        </Card>

        {/* Estadísticas por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos por tipo</CardTitle>
            <CardDescription>
              Distribución de contratos según su tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {contractStats?.byType && Object.entries(contractStats.byType).map(([type, count], index) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: getTypeColor(index) }}
                      />
                      <span>{type}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Los tipos se derivan de la clasificación interna
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Función para obtener colores para los tipos de contrato
function getTypeColor(index: number): string {
  const colors = [
    '#3b82f6', // azul
    '#8b5cf6', // violeta
    '#ec4899', // rosa
    '#f97316', // naranja
    '#14b8a6', // verde azulado
    '#06b6d4', // cian
    '#6366f1', // índigo
  ];
  
  return colors[index % colors.length];
} 