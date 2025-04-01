import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats, useUserMetrics } from '../../dashboard/hooks/useDashboardStats';

export function StatisticsOverviewCard() {
  const { data: dashboardStats, isLoading: isDashboardStatsLoading } = useDashboardStats();
  const { data: userMetrics, isLoading: isUserMetricsLoading } = useUserMetrics();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contratos activos</CardTitle>
        </CardHeader>
        <CardContent>
          {isDashboardStatsLoading ? (
            <Skeleton className="h-8 w-[60px]" />
          ) : (
            <div className="text-2xl font-bold">
              {dashboardStats?.activeContracts || 0}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Contratos vigentes actualmente
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes renovación</CardTitle>
        </CardHeader>
        <CardContent>
          {isDashboardStatsLoading ? (
            <Skeleton className="h-8 w-[60px]" />
          ) : (
            <div className="text-2xl font-bold">
              {dashboardStats?.pendingRenewals || 0}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Contratos a renovar en 30 días
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {isDashboardStatsLoading ? (
            <Skeleton className="h-8 w-[60px]" />
          ) : (
            <div className="text-2xl font-bold">
              {dashboardStats?.totalUsers || 0}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Usuarios registrados en el sistema
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mis contratos</CardTitle>
        </CardHeader>
        <CardContent>
          {isUserMetricsLoading ? (
            <Skeleton className="h-8 w-[60px]" />
          ) : (
            <div className="text-2xl font-bold">
              {userMetrics?.contractsCreated || 0}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Contratos creados por ti
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 