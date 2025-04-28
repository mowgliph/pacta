import React, { useEffect, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { Heading } from "../../components/ui/heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";

// Importar los componentes de estadísticas
import ContractsByStateChart from "../../components/statistics/ContractsByStateChart";
import ContractsByTypeChart from "../../components/statistics/ContractsByTypeChart";
import MonthlyContractsChart from "../../components/statistics/MonthlyContractsChart";
import ContractsValueDistribution from "../../components/statistics/ContractsValueDistribution";

export default function Statistics() {
  // Protección de ruta: redirecciona a login si no está autenticado
  const auth = useRequireAuth();
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStatistics() {
      if (auth.user) {
        try {
          setIsLoading(true);
          const statistics = await window.Electron.estadisticas.contratos();
          setStatsData(statistics);
        } catch (error) {
          console.error("Error al cargar estadísticas:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadStatistics();
  }, [auth.user]);

  if (!auth.user) return null;

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Heading
          title="Estadísticas Avanzadas"
          description="Análisis detallado de contratos y tendencias"
        />

        <Tabs defaultValue="distribution" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="distribution">Distribución</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
            <TabsTrigger value="values">Valores</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contratos por Estado</CardTitle>
                  <CardDescription>
                    Distribución según estado actual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ContractsByStateChart data={statsData?.byState || []} />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contratos por Tipo</CardTitle>
                  <CardDescription>
                    Distribución entre clientes y proveedores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <ContractsByTypeChart data={statsData?.byType || []} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Evolución Mensual de Contratos</CardTitle>
                <CardDescription>
                  Contratos nuevos y suplementos por mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <MonthlyContractsChart data={statsData?.monthly || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Monto</CardTitle>
                <CardDescription>
                  Análisis de valores de contratos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <ContractsValueDistribution data={statsData?.byValue || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
