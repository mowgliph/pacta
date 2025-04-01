import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticsChartCard } from './StatisticsChartCard';
import { useSpecificStats } from '../../dashboard/hooks/useDashboardStats';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';

export function ExpiredContractStatistics() {
  const { data: expiredContractStats, isLoading } = useSpecificStats('expired-contract' as any);
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // Datos para gráfico de contratos vencidos por mes
  const monthlyExpiredData = useMemo(() => {
    if (!expiredContractStats?.expiredContracts) return [];
    
    return expiredContractStats.expiredContracts.map(item => ({
      name: item.month.substring(0, 3), // Abreviatura del mes
      vencidos: item.count,
    }));
  }, [expiredContractStats]);
  
  // Datos para contratos vencidos por tipo
  const expiredByTypeData = useMemo(() => {
    if (!expiredContractStats?.expiredByType) return [];
    
    const typeEntries = Object.entries(expiredContractStats.expiredByType);
    // Calcular el total para los porcentajes
    const total = typeEntries.reduce((acc, [_, value]) => acc + value, 0);
    
    return typeEntries.map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
      color: getTypeColor(type),
    }));
  }, [expiredContractStats]);
  
  // Color según el tipo de contrato vencido
  function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      cliente: '#3b82f6', // azul
      proveedor: '#f59e0b', // ámbar
      servicio: '#8b5cf6', // violeta
      producto: '#ec4899', // rosa
      obra: '#14b8a6', // verde azulado
    };
    
    return colors[type.toLowerCase()] || '#64748b';
  }
  
  // Función para calcular el tiempo promedio de vencimiento
  const averageExpirationTime = useMemo(() => {
    if (!expiredContractStats || !expiredContractStats.byStatus) return 0;
    
    // Cálculo ficticio - en una implementación real, esto vendría del backend
    return Math.floor(Math.random() * 90) + 30; // Entre 30 y 120 días
  }, [expiredContractStats]);
  
  // Función para calcular el porcentaje de contratos renovados tras vencimiento
  const renewalRate = useMemo(() => {
    if (!expiredContractStats) return 0;
    
    // Cálculo ficticio - en una implementación real, esto vendría del backend
    return Math.floor(Math.random() * 40) + 30; // Entre 30% y 70%
  }, [expiredContractStats]);
  
  return (
    <div className="space-y-6">
      {/* Gráfico principal de contratos vencidos */}
      <StatisticsChartCard 
        title="Contratos Vencidos"
        description="Evolución de contratos vencidos por mes"
        data={monthlyExpiredData}
        isLoading={isLoading}
        xAxisKey="name"
        lines={[
          { dataKey: 'vencidos', name: 'Contratos Vencidos', color: '#ef4444' },
        ]}
        bars={[
          { dataKey: 'vencidos', name: 'Contratos Vencidos', color: '#ef4444' },
        ]}
        showSelect={true}
        selectOptions={[
          { value: 'month', label: 'Últimos 12 meses' },
          { value: 'year', label: 'Anual' },
        ]}
        onSelectChange={(value) => setTimeRange(value as 'month' | 'year')}
      />
      
      {/* Cuadrícula de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Contratos vencidos por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Vencimientos por tipo</CardTitle>
            <CardDescription>
              Distribución de contratos vencidos según su tipo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {expiredByTypeData.map((item) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{item.type}</span>
                      <span className="font-medium">{item.count} ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" style={{ backgroundColor: '#e2e8f0' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </Progress>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Última actualización: {expiredContractStats?.lastUpdated ? new Date(expiredContractStats.lastUpdated).toLocaleString() : 'Cargando...'}
          </CardFooter>
        </Card>
        
        {/* Métricas de vencimiento */}
        <div className="grid gap-4 md:grid-rows-2">
          {/* Tiempo promedio de vencimiento */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tiempo promedio de vencimiento</CardTitle>
              <CardDescription>
                Días promedio que un contrato permanece vencido antes de renovarse
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-24" />
              ) : (
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">{averageExpirationTime}</span>
                  <span className="text-muted-foreground">días</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Tasa de renovación */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tasa de renovación</CardTitle>
              <CardDescription>
                Porcentaje de contratos que se renuevan tras vencimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-24" />
              ) : (
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold">{renewalRate}%</span>
                    </div>
                  </div>
                  <Progress value={renewalRate} className="h-2 flex-1" style={{ backgroundColor: '#e2e8f0' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${renewalRate}%`, backgroundColor: renewalRate > 50 ? '#22c55e' : '#f59e0b' }}
                    />
                  </Progress>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 