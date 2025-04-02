import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatisticsChartCard } from './StatisticsChartCard';
import { useSpecificStats, useUserMetrics } from '../hooks/useStatistics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function UserAnalytics() {
  // SWR proporciona isLoading (o isValidating) directamente
  const { data: userStats, isLoading, error: userStatsError } = useSpecificStats('user');
  const { data: myMetrics, isLoading: isMetricsLoading, error: metricsError } = useUserMetrics();
  
  // Datos para gráfico de usuarios por mes
  const monthlyUserData = useMemo(() => {
    if (!userStats?.byMonth) return [];
    
    return userStats.byMonth.map(item => ({
      name: item.month.substring(0, 3), // Abreviatura del mes
      usuarios: item.count,
    }));
  }, [userStats]);
  
  // Datos de usuarios por rol
  const roleData = useMemo(() => {
    if (!userStats?.byRole) return [];
    
    return Object.entries(userStats.byRole).map(([role, count]) => ({
      role,
      count,
      color: getRoleColor(role),
    }));
  }, [userStats]);
  
  // Color según el rol
  function getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      admin: '#ef4444', // rojo
      manager: '#8b5cf6', // violeta
      user: '#3b82f6', // azul
      client: '#22c55e', // verde
      guest: '#94a3b8', // gris
    };
    
    return colors[role.toLowerCase()] || '#64748b';
  }
  
  return (
    <div className="space-y-6">
      {/* Gráfico principal de usuarios */}
      <StatisticsChartCard 
        title="Crecimiento de usuarios"
        description="Nuevos usuarios registrados por mes"
        data={monthlyUserData}
        isLoading={isLoading}
        xAxisKey="name"
        lines={[
          { dataKey: 'usuarios', name: 'Usuarios', color: '#8b5cf6' },
        ]}
        bars={[
          { dataKey: 'usuarios', name: 'Usuarios', color: '#8b5cf6' },
        ]}
      />
      
      {/* Cuadrícula de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Usuarios por rol */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios por rol</CardTitle>
            <CardDescription>
              Distribución de usuarios según su rol en el sistema
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
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-right">Usuarios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleData.map((item) => (
                    <TableRow key={item.role}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <span className="capitalize">{item.role}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Mis métricas */}
        <Card>
          <CardHeader>
            <CardTitle>Mi actividad</CardTitle>
            <CardDescription>
              Resumen de tu actividad en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isMetricsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm">Contratos creados</span>
                  <span className="font-medium">{myMetrics?.contractsCreated || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm">Contratos actualizados</span>
                  <span className="font-medium">{myMetrics?.contractsUpdated || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm">Documentos subidos</span>
                  <span className="font-medium">{myMetrics?.documentsUploaded || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Última actividad</span>
                  <Badge variant="outline">
                    {myMetrics?.lastActivity 
                      ? new Date(myMetrics.lastActivity).toLocaleDateString() 
                      : 'No disponible'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Las métricas se actualizan cada 10 minutos
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 