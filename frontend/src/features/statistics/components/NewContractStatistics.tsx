import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticsChartCard } from './StatisticsChartCard';
import { useSpecificStats } from '../hooks/useStatistics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function NewContractStatistics() {
  const { data: newContractStats, isLoading } = useSpecificStats('new-contract' as any);
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // Datos para gráfico de nuevos contratos por mes
  const monthlyContractData = useMemo(() => {
    if (!newContractStats?.newContractsByMonth) return [];
    
    return newContractStats.newContractsByMonth.map(item => ({
      name: item.month.substring(0, 3), // Abreviatura del mes
      contratos: item.count,
    }));
  }, [newContractStats]);
  
  // Datos para tipos de nuevos contratos
  const contractTypeData = useMemo(() => {
    if (!newContractStats?.newContractsByType) return [];
    
    const typeEntries = Object.entries(newContractStats.newContractsByType);
    // Calcular el total para los porcentajes
    const total = typeEntries.reduce((acc, [_, value]) => acc + value, 0);
    
    return typeEntries.map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
      color: getContractTypeColor(type),
    }));
  }, [newContractStats]);
  
  // Color según el tipo de contrato
  function getContractTypeColor(type: string): string {
    const colors: Record<string, string> = {
      cliente: '#3b82f6', // azul
      proveedor: '#f59e0b', // ámbar
      servicio: '#8b5cf6', // violeta
      producto: '#ec4899', // rosa
      obra: '#14b8a6', // verde azulado
    };
    
    return colors[type.toLowerCase()] || '#64748b';
  }
  
  // Datos para tendencia de crecimiento
  const growthTrendData = useMemo(() => {
    if (!newContractStats?.newContractsTrend) return [];
    
    return newContractStats.newContractsTrend.map(item => ({
      name: `${item.month.substring(0, 3)} ${item.year}`,
      contratos: item.count,
    }));
  }, [newContractStats]);
  
  // Tasa de crecimiento (cálculo ficticio)
  const growthRate = useMemo(() => {
    if (!newContractStats?.newContractsByMonth || newContractStats.newContractsByMonth.length < 2) {
      return 0;
    }
    
    // Cálculo ficticio - en una implementación real, vendría del backend
    const rate = Math.floor(Math.random() * 50) - 10; // Entre -10% y +40%
    return rate;
  }, [newContractStats]);
  
  return (
    <div className="space-y-6">
      {/* Gráfico principal de nuevos contratos */}
      <StatisticsChartCard 
        title="Nuevos Contratos"
        description="Nuevos contratos creados por mes"
        data={monthlyContractData}
        isLoading={isLoading}
        xAxisKey="name"
        lines={[
          { dataKey: 'contratos', name: 'Nuevos Contratos', color: '#22c55e' },
        ]}
        bars={[
          { dataKey: 'contratos', name: 'Nuevos Contratos', color: '#22c55e' },
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
        {/* Tipos de contratos nuevos */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de contratos nuevos</CardTitle>
            <CardDescription>
              Distribución de nuevos contratos según su tipo
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
                {contractTypeData.map((item) => (
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
            Última actualización: {newContractStats?.lastUpdated ? new Date(newContractStats.lastUpdated).toLocaleString() : 'Cargando...'}
          </CardFooter>
        </Card>
        
        {/* Métricas de crecimiento */}
        <div className="grid gap-4 md:grid-rows-2">
          {/* Tasa de crecimiento */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tasa de crecimiento</CardTitle>
              <CardDescription>
                Crecimiento en nuevos contratos respecto al período anterior
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-24" />
              ) : (
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="flex items-baseline space-x-2">
                      <span className={`text-3xl font-bold ${growthRate > 0 ? 'text-emerald-500' : growthRate < 0 ? 'text-red-500' : ''}`}>
                        {growthRate > 0 ? '+' : ''}{growthRate}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.abs(growthRate) > 100 ? 100 : Math.abs(growthRate)} 
                    className="h-2 flex-1" 
                    style={{ backgroundColor: '#e2e8f0' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${Math.abs(growthRate) > 100 ? 100 : Math.abs(growthRate)}%`,
                        backgroundColor: growthRate > 0 ? '#22c55e' : '#ef4444'
                      }}
                    />
                  </Progress>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Tendencia de crecimiento */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Tendencia anual</CardTitle>
              <CardDescription>
                Tendencia de creación de contratos en el último año
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-20">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="h-20 flex items-end space-x-1">
                  {growthTrendData.slice(-12).map((item, index) => (
                    <div 
                      key={index} 
                      className="relative flex-1 bg-emerald-100 rounded-t"
                      style={{ 
                        height: `${Math.min(100, (item.contratos / 10) * 100)}%`,
                        backgroundColor: index % 2 === 0 ? '#dcfce7' : '#d1fae5'
                      }}
                    >
                      {index % 3 === 0 && (
                        <span className="absolute -bottom-5 left-0 text-xs text-muted-foreground rotate-45 origin-top-left">
                          {item.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 