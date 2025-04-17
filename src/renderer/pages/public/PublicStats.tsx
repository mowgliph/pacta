import React, { useState, useEffect } from 'react';
import { Card } from "@/renderer/components/ui/card";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import statisticsService from '@/renderer/services/statisticsService';
import { AlertTriangle } from 'lucide-react'; // Importar icono de alerta

interface StatsData {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  contractStats: Array<{
    month: string;
    activos: number;
    vencidos: number;
  }>;
}

const PublicStats: React.FC = () => {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Estado para el error

  useEffect(() => {
    const loadStats = async (): Promise<void> => {
      setIsLoading(true);
      setError(null); // Resetear error al iniciar carga
      try {
        const rawData = await statisticsService.getGeneralStatistics();
        
        // Transformar los datos para cumplir con la interfaz StatsData
        const transformedData: StatsData = {
          totalContracts: rawData.totalContracts || 0,
          activeContracts: rawData.activeContracts || 0,
          expiringContracts: rawData.expiringContracts || 0,
          contractStats: rawData.contractStats || [] // Si no existe, usar array vacío
        };
        
        setStatsData(transformedData);
      } catch (err) {
        console.error("Error cargando estadísticas públicas:", err);
        setError("No se pudieron cargar las estadísticas públicas. Inténtalo de nuevo más tarde."); // Guardar mensaje de error
      }
      setIsLoading(false);
    };
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-6 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  // Mostrar mensaje de error si existe
  if (error) {
    return (
      <Card className="p-6 border-destructive bg-destructive/10 text-destructive">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="mt-2 text-sm">{error}</p>
      </Card>
    );
  }

  const stats = statsData || {
    totalContracts: 0,
    activeContracts: 0,
    expiringContracts: 0,
    contractStats: [],
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Contratos</h3>
          <p className="text-3xl font-bold">{stats.totalContracts}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Contratos Activos</h3>
          <p className="text-3xl font-bold">{stats.activeContracts}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Próximos a Vencer</h3>
          <p className="text-3xl font-bold">{stats.expiringContracts}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tendencia Mensual</h3>
        <div className="h-64">
          {/* Aquí puedes agregar un gráfico con los datos de stats.contractStats */}
          <div className="grid grid-cols-6 h-full gap-2">
            {stats.contractStats.map((stat) => (
              <div key={stat.month} className="flex flex-col justify-end">
                <div 
                  className="bg-primary/20 rounded-t"
                  style={{ height: `${(stat.activos / 50) * 100}%` }}
                />
                <span className="text-xs text-center mt-2">{stat.month}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PublicStats;