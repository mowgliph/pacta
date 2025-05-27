// En renderer/app/statistics/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart2, TrendingUp, FileText, AlertCircle } from "lucide-react";
import { useStatistics } from "@/lib/useStatistics";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Tipos para los datos
interface ContractStats {
  byStatus: Array<{
    status: string;
    _count: { _all: number };
  }>;
  byType: Array<{
    type: string;
    _count: { _all: number };
  }>;
}

export default function StatisticsPage() {
  // Usar el hook con tipado fuerte
  const { 
    data, 
    loading, 
    error, 
    refetch,
    lastUpdated 
  } = useStatistics<{ stats: ContractStats }>('dashboard');

  // Mapeo seguro de datos con tipado
  const total = data?.stats?.byStatus?.reduce(
    (acc, s) => acc + (s._count?._all || 0), 
    0
  ) || 0;

  const active = data?.stats?.byStatus?.find(s => s.status === "Vigente")?._count?._all || 0;
  const expiring = data?.stats?.byStatus?.find(s => s.status === "Próximo a Vencer")?._count?._all || 0;
  const expired = data?.stats?.byStatus?.find(s => s.status === "Vencido")?._count?._all || 0;
  
  const byType = data?.stats?.byType?.reduce(
    (acc, t) => ({ ...acc, [t.type]: t._count._all }),
    {} as Record<string, number>
  ) || {};

  // Función para manejar la recarga
  const handleRefresh = () => {
    refetch().catch(console.error);
  };

  // Estado de carga
  if (loading && !data) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Manejo de errores
  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#001B48]">Estadísticas</h1>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Reintentar
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar las estadísticas</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#001B48]">Estadísticas</h1>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Actualizado: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-3xl font-bold text-[#018ABE]">
              <FileText className="h-6 w-6" /> 
              {total.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Otras cards similares... */}
      </div>

      {/* Sección de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de estado de contratos */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg">Contratos por Estado</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Implementar gráfico con los datos */}
            <div className="h-80 flex items-center justify-center bg-muted/50 rounded-md">
              <p className="text-muted-foreground">Gráfico de estados</p>
            </div>
          </CardContent>
        </Card>

        {/* Otros gráficos... */}
      </div>
    </div>
  );
}