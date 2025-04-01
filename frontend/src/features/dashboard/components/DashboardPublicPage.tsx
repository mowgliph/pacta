import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { DashboardStatsCards } from '../components/DashboardStatsCards';
import { RecentActivityPublic } from '../components/RecentActivityPublic';
import { QuickActionsPublic } from '../components/QuickActionsPublic';
import { PageHeader } from '@/components/layout/PageHeader';
import { IconArrowRight } from '@tabler/icons-react';

export const DashboardPublicPage: React.FC = () => {
  // Obtener datos públicos
  const { data: dashboardStats, isLoading } = useDashboardStats();

  // Controlador para eventos de autenticación requerida
  const handleRequireAuth = () => {
    // Redireccionar a la página de login
    window.location.href = '/login';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel Público"
        description="Información general de la plataforma"
      />

      {/* Acciones rápidas públicas */}
      <QuickActionsPublic />

      {/* Tarjetas de estadísticas (versión pública) */}
      <DashboardStatsCards 
        activeContracts={dashboardStats?.activeContracts || 0}
        pendingRenewals={dashboardStats?.pendingRenewals || 0}
        totalUsers={dashboardStats?.totalUsers || 0}
        alerts={dashboardStats?.alerts || 0}
        isLoading={isLoading}
        isPublic={true}
        onRequireAuth={handleRequireAuth}
      />

      {/* Actividad reciente (versión pública limitada) */}
      <div className="grid gap-4 md:grid-cols-1">
        <RecentActivityPublic 
          isLoading={isLoading}
        />
      </div>

      {/* Tarjeta CTA para registrarse */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>¿Desea acceder a todas las funcionalidades?</CardTitle>
          <CardDescription>
            Regístrese o inicie sesión para acceder a todas las características de la plataforma
          </CardDescription>
          <div className="flex flex-col gap-2 sm:flex-row pt-4">
            <Button asChild>
              <Link to="/login">
                Iniciar Sesión <IconArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">
                Registrarse
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}; 