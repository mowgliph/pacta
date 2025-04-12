import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { fetchStatistics } from '@/renderer/api/electronAPI';
import { useToast } from '@/renderer/hooks/use-toast';
import { Button } from "@/renderer/components/ui/button";
import { Loader2, AlertTriangle, BarChart2, FileText } from 'lucide-react';
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

const AdvancedStatistics = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchStatistics({ /* filtros */ });
        if (data) {
          setStatsData(data);
        } else {
          setError('No se recibieron datos de estadísticas.');
          toast({ title: 'Advertencia', description: 'No se pudieron obtener los datos de estadísticas.', variant: 'default' });
        }
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError('Error al cargar las estadísticas.');
        toast({ title: 'Error', description: 'No se pudieron cargar las estadísticas.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [toast]);

  const exportReport = () => {
    toast({ title: 'Info', description: 'Funcionalidad de exportar reporte pendiente.' });
  };

  let content;
  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonChart />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonTable rows={5} columns={4} />
          </CardContent>
        </Card>
      </div>
    );
  } else if (error) {
    content = <p className="text-red-600 text-center p-4">{error}</p>;
  } else if (statsData) {
    
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
            <h1 className="text-2xl font-bold" aria-level="1">Estadísticas Avanzadas</h1>
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