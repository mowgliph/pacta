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
    content = (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span>Cargando estadísticas...</span>
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
      <div className="space-y-6">
        {/* Fila de Tarjetas de Resumen */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contratos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalContracts ?? 'N/A'}</div>
              {/* <p className="text-xs text-muted-foreground">+2 desde ayer</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencen Pronto (30d)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.expiringSoonCount ?? 'N/A'}</div>
              {/* <p className="text-xs text-muted-foreground">+5 esta semana</p> */}
            </CardContent>
          </Card>
           {/* Añadir más tarjetas si hay más datos */}
        </div>

        {/* Gráfico de Contratos por Estado */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5"/> Contratos por Estado</CardTitle>
            </CardHeader>
            <CardContent className="pl-2"> { /* Ajuste padding para ejes */}
                {statusChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            {/* Usar un color fijo o mapear colores por estado */}
                            <Bar dataKey="Contratos" fill="#8884d8" /> 
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-500 py-4">No hay datos de estado para mostrar.</p>
                )}
            </CardContent>
        </Card>
        
         {/* Añadir más gráficos para otras estadísticas */}

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