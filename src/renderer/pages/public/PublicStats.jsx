import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { fetchStatistics } from '@/renderer/api/electronAPI';

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
        className="space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-24 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  const {
    totalContracts = 0,
    activeContracts = 0,
    expiringContracts = 0,
    contractStats = []
  } = statsData || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-medium">Contratos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.span 
                className="text-3xl font-bold block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {totalContracts}
              </motion.span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-medium">Contratos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.span 
                className="text-3xl font-bold text-green-500 block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                {activeContracts}
              </motion.span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-medium">Próximos a Vencer</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.span 
                className="text-3xl font-bold text-yellow-500 block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                {expiringContracts}
              </motion.span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-medium">Tasa de Renovación</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.span 
                className="text-3xl font-bold text-blue-500 block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {activeContracts > 0 ? Math.round((activeContracts / totalContracts) * 100) : 0}%
              </motion.span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contractStats}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="activos" 
                    fill="var(--primary)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="vencidos" 
                    fill="var(--destructive)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PublicStats;