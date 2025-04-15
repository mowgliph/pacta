import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import statisticsService from '@/renderer/services/statisticsService';
import { useToast } from '@/renderer/hooks/use-toast';
import { Button } from "@/renderer/components/ui/button";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import { AlertTriangle, BarChart2, FileText } from 'lucide-react';
import LoadingState from '@/renderer/components/LoadingState';
import ErrorState from '@/renderer/components/ErrorState';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/renderer/components/ui/card";
import { SkeletonCard, SkeletonChart, SkeletonTable } from '@/renderer/components/ui/skeleton';
import { HoverElevation, HoverScale, HoverGlow, HoverBounce } from '@/renderer/components/ui/micro-interactions';

interface StatsData {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  statusCounts?: Record<string, number>;
  monthlyStats?: Array<{
    month: string;
    activos: number;
    vencidos: number;
  }>;
  statusDistribution?: Array<{
    status: string;
    count: number;
  }>;
}

interface StatusChartData {
  name: string;
  Contratos: number;
}

const AdvancedStatistics: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await statisticsService.getGeneralStatistics();
        if (data) {
          setStatsData(data);
        } else {
          setError('No se encontraron datos estadísticos.');
          toast({ 
            title: 'Advertencia', 
            description: 'No se pudieron obtener los datos estadísticos.', 
            variant: 'default' 
          });
        }
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);
        setError('Error al cargar las estadísticas.');
        toast({ 
          title: 'Error', 
          description: 'No se pudieron cargar las estadísticas. Por favor, inténtelo de nuevo.', 
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, [toast]);

  const exportReport = async (): Promise<void> => {
    try {
      if (!statsData) {
        toast({ 
          title: 'Error', 
          description: 'No hay datos disponibles para exportar.', 
          variant: 'destructive' 
        });
        return;
      }

      await statisticsService.exportReport(statsData);
      toast({ 
        title: 'Éxito', 
        description: 'El reporte ha sido exportado correctamente.', 
        variant: 'default' 
      });
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      toast({ 
        title: 'Error', 
        description: 'No se pudo exportar el reporte. Por favor, inténtelo de nuevo.', 
        variant: 'destructive' 
      });
    }
  };

  // Transform status counts to chart data
  const statusChartData: StatusChartData[] = statsData?.statusCounts 
    ? Object.entries(statsData.statusCounts).map(([status, count]) => ({ 
        name: status, 
        Contratos: count 
    }))
    : [];

  if (isLoading) {
    return <LoadingState message="Cargando estadísticas..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!statsData) {
    return <div className="text-center p-4">No hay datos estadísticos disponibles.</div>;
  }

  let content;
  if (statsData) {
    
    // --- Preparar datos para el gráfico de barras --- 
    // Convertir { Active: 10, Pending: 5 } a [{ name: 'Active', count: 10 }, { name: 'Pending', count: 5 }]
    const statusChartData = Object.entries(statsData.statusCounts || {}).map(([status, count]) => ({ 
        name: status, 
        Contratos: count 
    }));

    content = (
      <div className="space-y-6 p-4 md:p-6 lg:p-8" role="main" aria-label="Estadísticas avanzadas">
        <div className="flex justify-between items-center">
          <HoverScale>
            <h1 className="text-2xl font-bold" aria-level={1}>Estadísticas Avanzadas</h1>
          </HoverScale>
          <HoverBounce>
            <Button 
              onClick={exportReport} 
              className="flex items-center"
              aria-label="Exportar reporte de estadísticas"
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Exportar Reporte
            </Button>
          </HoverBounce>
        </div>

        <div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          role="region"
          aria-label="Resumen de estadísticas"
        >
          <HoverElevation>
            <Card role="article" aria-label="Contratos totales">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" aria-hidden="true" />
                  Contratos Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" aria-label={`${statsData?.totalContracts || 0} contratos totales`}>
                  {statsData?.totalContracts || 0}
                </p>
              </CardContent>
            </Card>
          </HoverElevation>

          <HoverElevation>
            <Card role="article" aria-label="Contratos activos">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" aria-hidden="true" />
                  Contratos Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500" aria-label={`${statsData?.activeContracts || 0} contratos activos`}>
                  {statsData?.activeContracts || 0}
                </p>
              </CardContent>
            </Card>
          </HoverElevation>

          <HoverElevation>
            <Card role="article" aria-label="Contratos próximos a vencer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" aria-hidden="true" />
                  Próximos a Vencer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-500" aria-label={`${statsData?.expiringContracts || 0} contratos próximos a vencer`}>
                  {statsData?.expiringContracts || 0}
                </p>
              </CardContent>
            </Card>
          </HoverElevation>
        </div>

        <div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          role="region"
          aria-label="Gráficos de estadísticas"
        >
          <HoverGlow>
            <Card role="article" aria-label="Estadísticas por mes">
              <CardHeader>
                <CardTitle>Estadísticas por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]" role="img" aria-label="Gráfico de estadísticas mensuales">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData?.monthlyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activos" fill="#8884d8" />
                      <Bar dataKey="vencidos" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </HoverGlow>

          <HoverGlow>
            <Card role="article" aria-label="Distribución por estado">
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]" role="img" aria-label="Gráfico de distribución por estado">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData?.statusDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </HoverGlow>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalContracts ?? 'N/A'}</div>
            <div className="text-2xl font-bold text-green-500">{statsData.activeContracts ?? 'N/A'}</div>
            <div className="text-2xl font-bold text-yellow-500">{statsData.expiringContracts ?? 'N/A'}</div>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    content = <p className="text-center text-gray-500 p-4">No hay datos de estadísticas disponibles.</p>;
  }

  return (
    <div className="space-y-6"> { /* Asegurar espaciado */}
      {/* Encabezado Consistente */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Estadísticas Avanzadas</h1>
        {/* Botón Exportar (funcionalidad pendiente) */}
        <Button onClick={exportReport}>Exportar Reporte</Button>
        {/* Quitar botón Volver si ya está en Sidebar */} 
      </div>
      
      {/* Mostrar contenido (carga, error o datos) */}
      <div className="mt-4"> { /* O quitar este div si space-y-6 es suficiente */} 
        {content}
      </div>
    </div>
  );
};

export default AdvancedStatistics;