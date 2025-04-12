import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { fetchStatistics } from '@/renderer/api/electronAPI';
import { SkeletonCard, SkeletonChart } from '@/renderer/components/ui/skeleton';
import { HoverScale, HoverElevation, HoverGlow } from '@/renderer/components/ui/hover-effects';
import { FileText, CheckCircle, Plus } from 'lucide-react';

const PublicStats = () => {
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStatistics();
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 p-4 md:p-6 lg:p-8"
      >
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas Generales</CardTitle>
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
      </motion.div>
    );
  }

  const {
    totalContracts = 0,
    activeContracts = 0,
    expiringContracts = 0,
    contractStats = [],
    statusDistribution = [],
    monthlyTrend = []
  } = statsData || {};

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8" role="main" aria-label="Estadísticas públicas">
      <div className="text-center" role="banner" aria-label="Encabezado de estadísticas">
        <HoverScale>
          <h1 className="text-3xl font-bold" aria-level="1">Estadísticas Públicas</h1>
        </HoverScale>
        <p className="mt-2 text-muted-foreground" aria-label="Descripción de las estadísticas">
          Visualización de datos generales sobre contratos y suplementos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3" role="region" aria-label="Resumen de estadísticas">
        <HoverElevation>
          <Card role="article" aria-label="Contratos totales">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
                Contratos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" aria-label={`${totalContracts} contratos totales`}>
                {totalContracts}
              </p>
            </CardContent>
          </Card>
        </HoverElevation>

        <HoverElevation>
          <Card role="article" aria-label="Contratos activos">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" aria-hidden="true" />
                Contratos Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500" aria-label={`${activeContracts} contratos activos`}>
                {activeContracts}
              </p>
            </CardContent>
          </Card>
        </HoverElevation>

        <HoverElevation>
          <Card role="article" aria-label="Suplementos totales">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                Suplementos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold" aria-label={`${statsData?.totalSupplements || 0} suplementos totales`}>
                {statsData?.totalSupplements || 0}
              </p>
            </CardContent>
          </Card>
        </HoverElevation>
      </div>

      <div className="grid gap-6 md:grid-cols-2" role="region" aria-label="Gráficos de estadísticas">
        <HoverGlow>
          <Card role="article" aria-label="Distribución por estado">
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]" role="img" aria-label="Gráfico de distribución por estado">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart data={statusDistribution}>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </HoverGlow>

        <HoverGlow>
          <Card role="article" aria-label="Tendencia mensual">
            <CardHeader>
              <CardTitle>Tendencia Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]" role="img" aria-label="Gráfico de tendencia mensual">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </HoverGlow>
      </div>

      <div className="text-center" role="complementary" aria-label="Información adicional">
        <p className="text-sm text-muted-foreground">
          Los datos se actualizan automáticamente cada 24 horas
        </p>
      </div>
    </div>
  );
};

export default PublicStats;