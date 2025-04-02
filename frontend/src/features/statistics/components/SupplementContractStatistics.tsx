import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticsChartCard } from './StatisticsChartCard';
import { useSpecificStats } from '../hooks/useStatistics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function SupplementContractStatistics() {
  const { data: supplementContractStats, isLoading } = useSpecificStats('supplement-contract' as any);
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // Datos para gráfico de suplementos por mes
  const monthlySupplementData = useMemo(() => {
    if (!supplementContractStats?.supplementsByMonth) return [];
    
    return supplementContractStats.supplementsByMonth.map(item => ({
      name: item.month.substring(0, 3), // Abreviatura del mes
      suplementos: item.count,
    }));
  }, [supplementContractStats]);
  
  // Datos para tipos de suplementos
  const supplementTypeData = useMemo(() => {
    if (!supplementContractStats?.supplementsByType) return [];
    
    const typeEntries = Object.entries(supplementContractStats.supplementsByType);
    // Calcular el total para los porcentajes
    const total = typeEntries.reduce((acc, [_, value]) => acc + value, 0);
    
    return typeEntries.map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
      color: getSupplementTypeColor(type),
    }));
  }, [supplementContractStats]);
  
  // Color según el tipo de suplemento
  function getSupplementTypeColor(type: string): string {
    const colors: Record<string, string> = {
      precio: '#ef4444', // rojo
      plazo: '#3b82f6', // azul
      servicio: '#8b5cf6', // violeta
      alcance: '#f59e0b', // ámbar
      otro: '#94a3b8', // gris
    };
    
    return colors[type.toLowerCase()] || '#64748b';
  }
  
  // Porcentaje de contratos con suplementos vs sin suplementos
  const withSupplementsPercentage = useMemo(() => {
    if (!supplementContractStats?.withSupplements || !supplementContractStats?.withoutSupplements) {
      return 0;
    }
    
    const total = (supplementContractStats.withSupplements || 0) + (supplementContractStats.withoutSupplements || 0);
    if (total === 0) return 0;
    
    return Math.round((supplementContractStats.withSupplements / total) * 100);
  }, [supplementContractStats]);
  
  // Promedio de suplementos por contrato (cálculo ficticio)
  const averageSupplementsPerContract = useMemo(() => {
    if (!supplementContractStats?.withSupplements) return 0;
    
    // Cálculo ficticio - en una implementación real, esto vendría del backend
    return ((Math.random() * 0.8) + 1.2).toFixed(1); // Entre 1.2 y 2.0
  }, [supplementContractStats]);
  
  return (
    <div className="space-y-6">
      {/* Gráfico principal de suplementos */}
      <StatisticsChartCard 
        title="Contratos con Suplementos"
        description="Evolución de suplementos a contratos por mes"
        data={monthlySupplementData}
        isLoading={isLoading}
        xAxisKey="name"
        lines={[
          { dataKey: 'suplementos', name: 'Suplementos', color: '#8b5cf6' },
        ]}
        bars={[
          { dataKey: 'suplementos', name: 'Suplementos', color: '#8b5cf6' },
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
        {/* Tipos de suplementos */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de suplementos</CardTitle>
            <CardDescription>
              Distribución de suplementos según su tipo
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
                {supplementTypeData.map((item) => (
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
            Última actualización: {supplementContractStats?.lastUpdated ? new Date(supplementContractStats.lastUpdated).toLocaleString() : 'Cargando...'}
          </CardFooter>
        </Card>
        
        {/* Métricas de suplementos */}
        <div className="grid gap-4 md:grid-rows-2">
          {/* Contratos con vs sin suplementos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Contratos con suplementos</CardTitle>
              <CardDescription>
                Proporción de contratos que han sido modificados con suplementos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-24" />
              ) : (
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold">{withSupplementsPercentage}%</span>
                    </div>
                  </div>
                  <Progress value={withSupplementsPercentage} className="h-2 flex-1" style={{ backgroundColor: '#e2e8f0' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${withSupplementsPercentage}%`, backgroundColor: '#8b5cf6' }}
                    />
                  </Progress>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Promedio de suplementos por contrato */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Promedio de suplementos</CardTitle>
              <CardDescription>
                Número promedio de suplementos por contrato modificado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-24" />
              ) : (
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">{averageSupplementsPerContract}</span>
                  <span className="text-muted-foreground">suplementos por contrato</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 