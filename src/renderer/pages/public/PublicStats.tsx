import React, { useState, useEffect } from 'react';
import { Card } from "@/renderer/components/ui/card";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import statisticsService from '@/renderer/services/statisticsService';

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

  useEffect(() => {
    const loadStats = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const data = await statisticsService.getPublicStatistics();
        setStatsData(data);
      } catch (error) {
        console.error("Error cargando estadísticas públicas:", error);
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