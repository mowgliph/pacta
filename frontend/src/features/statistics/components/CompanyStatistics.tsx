import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticsChartCard } from './StatisticsChartCard';
import { useSpecificStats } from '../../dashboard/hooks/useDashboardStats';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function CompanyStatistics() {
  const { data: companyStats, isLoading } = useSpecificStats('company' as any);
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

  // Datos para gráfico de empresas por mes
  const monthlyCompanyData = useMemo(() => {
    if (!companyStats?.companiesPerMonth) return [];
    
    return companyStats.companiesPerMonth.map(item => ({
      name: item.month.substring(0, 3), // Abreviatura del mes
      empresas: item.count,
    }));
  }, [companyStats]);
  
  // Datos de empresas por tipo
  const companyTypeData = useMemo(() => {
    if (!companyStats?.byCompanyType) return [];
    
    const typeEntries = Object.entries(companyStats.byCompanyType);
    // Calcular el total para los porcentajes
    const total = typeEntries.reduce((acc, [_, value]) => acc + value, 0);
    
    return typeEntries.map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100),
      color: getCompanyTypeColor(type),
    }));
  }, [companyStats]);
  
  // Color según el tipo de empresa
  function getCompanyTypeColor(type: string): string {
    const colors: Record<string, string> = {
      cliente: '#22c55e', // verde
      proveedor: '#f59e0b', // ámbar
      ambos: '#8b5cf6', // violeta
      potencial: '#3b82f6', // azul
      inactivo: '#94a3b8', // gris
    };
    
    return colors[type.toLowerCase()] || '#64748b';
  }
  
  // Principales empresas por número de contratos
  const topCompaniesData = useMemo(() => {
    if (!companyStats?.byCompany) return [];
    
    return Object.entries(companyStats.byCompany)
      .sort((a, b) => b[1] - a[1]) // Ordenar de mayor a menor
      .slice(0, 5) // Tomar los 5 primeros
      .map(([company, count]) => ({
        company,
        count
      }));
  }, [companyStats]);
  
  return (
    <div className="space-y-6">
      {/* Gráfico principal de empresas */}
      <StatisticsChartCard 
        title="Registro de empresas"
        description="Nuevas empresas registradas por mes"
        data={monthlyCompanyData}
        isLoading={isLoading}
        xAxisKey="name"
        lines={[
          { dataKey: 'empresas', name: 'Empresas', color: '#22c55e' },
        ]}
        bars={[
          { dataKey: 'empresas', name: 'Empresas', color: '#22c55e' },
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
        {/* Empresas por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas por tipo</CardTitle>
            <CardDescription>
              Distribución de empresas según su clasificación
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
                {companyTypeData.map((item) => (
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
            Última actualización: {companyStats?.lastUpdated ? new Date(companyStats.lastUpdated).toLocaleString() : 'Cargando...'}
          </CardFooter>
        </Card>
        
        {/* Top empresas por contratos */}
        <Card>
          <CardHeader>
            <CardTitle>Top empresas</CardTitle>
            <CardDescription>
              Empresas con mayor número de contratos
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
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-right">Contratos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCompaniesData.map((item) => (
                    <TableRow key={item.company}>
                      <TableCell>{item.company}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Basado en número de contratos activos
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 