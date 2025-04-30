"use client";

import { useEffect, useState } from "react";
import { FileText, AlertTriangle, Clock, Users } from "lucide-react";
import { StatisticsCard } from "@/components/dashboard/StatisticsCard";
import { ContractTrendsChart } from "@/components/dashboard/ContractTrendsChart";
import { UpcomingActions } from "@/components/dashboard/UpcomingActions";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [upcomingActions, setUpcomingActions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsResponse, trendsResponse, actionsResponse] =
          await Promise.all([
            window.Electron.dashboard.getStatistics(),
            window.Electron.dashboard.getTrends(),
            window.Electron.dashboard.getUpcomingActions(),
          ]);

        if (statsResponse.success) {
          setStatistics(statsResponse.data);
        } else {
          throw new Error(statsResponse.error);
        }

        if (trendsResponse.success) {
          setTrends(trendsResponse.data);
        } else {
          throw new Error(trendsResponse.error);
        }

        if (actionsResponse.success) {
          setUpcomingActions(actionsResponse.data);
        } else {
          throw new Error(actionsResponse.error);
        }
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del dashboard",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatisticsCard
          title="Total de Contratos"
          value={statistics?.totals.total || 0}
          icon={<FileText className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatisticsCard
          title="Contratos Activos"
          value={statistics?.totals.active || 0}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatisticsCard
          title="Próximos a Vencer"
          value={statistics?.totals.expiring || 0}
          icon={<Clock className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatisticsCard
          title="Contratos Vencidos"
          value={statistics?.totals.expired || 0}
          icon={<AlertTriangle className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ContractTrendsChart data={trends || {}} isLoading={isLoading} />
        <UpcomingActions
          upcomingContracts={upcomingActions?.upcomingContracts || []}
          pendingSupplements={upcomingActions?.pendingSupplements || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
