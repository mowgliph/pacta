import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticsChartCard } from './StatisticsChartCard';
import { useSpecificStats } from '../../dashboard/hooks/useDashboardStats';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function ProviderContractStatistics() {
  const { data: providerContractStats, isLoading } = useSpecificStats('provider-contract' as any);
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // Datos para gráfico de contratos de proveedores por mes
  const monthlyContractData = useMemo(() => {
    if (!providerContractStats?.byMonth) return [];
    
    return providerContractStats.byMonth.map(item => ({
      name: item.month.substring(0, 3), // Abreviatura del mes
      contratos: item.count,
    }));
  }, [providerContractStats]);
  
  // Datos para contratos de proveedores por estado
  const contractStatusData = useMemo(() => {
    if (!providerContractStats?.byStatus) return [];
    
    const statusEntries = Object.entries(providerContractStats.byStatus);
    // Calcular el total para los porcentajes
    const total = statusEntries.reduce((acc, [_, value]) => acc + value, 0);
    
    return statusEntries.map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100),
      color: getStatusColor(status),
    }));
  }, [providerContractStats]);
  
  // Contratos de proveedores por categoría
  const contractTypeData = useMemo(() => {
    if (!providerContractStats?.byProviderContract) return [];
    
    return Object.entries(providerContractStats.byProviderContract)
      .sort((a, b) => b[1] - a[1]) // Ordenar de mayor a menor
      .map(([type, count]) => ({
        type,
        count
      }));
  }, [providerContractStats]);
  
  // Color según el estado del contrato
  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      ACTIVE: '#22c55e', // verde
      PENDING: '#f59e0b', // ámbar
      EXPIRED: '#ef4444', // rojo
      DRAFT: '#94a3b8', // gris
      CANCELED: '#64748b', // gris oscuro
    };
    
    return colors[status] || '#cbd5e1';
  }
  
  return (
    <div className="space-y-6">
      {/* Gráfico principal de contratos de proveedores */}
      <StatisticsChartCard 
        title="Contratos de Proveedores"
        description="Evolución de contratos con proveedores por mes"
        data={monthlyContractData}
        isLoading={isLoading}
        xAxisKey="name"
        lines={[
          { dataKey: 'contratos', name: 'Contratos', color: '#f59e0b' },
        ]}
        bars={[
          { dataKey: 'contratos', name: 'Contratos', color: '#f59e0b' },
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
        {/* Contratos por estado */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos por estado</CardTitle>
            <CardDescription>
              Distribución de contratos de proveedores según su estado
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
                {contractStatusData.map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{item.status.toLowerCase()}</span>
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
            Última actualización: {providerContractStats?.lastUpdated ? new Date(providerContractStats.lastUpdated).toLocaleString() : 'Cargando...'}
          </CardFooter>
        </Card>
        
        {/* Contratos por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos por categoría</CardTitle>
            <CardDescription>
              Distribución de contratos de proveedores por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractTypeData.map((item) => (
                    <TableRow key={item.type}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Clasificación según tipo de contrato con proveedores
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 