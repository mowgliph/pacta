import React from 'react';
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

const mockData = {
  contractStats: [
    { month: 'Ene', activos: 65, vencidos: 12 },
    { month: 'Feb', activos: 59, vencidos: 15 },
    { month: 'Mar', activos: 80, vencidos: 8 },
    { month: 'Abr', activos: 81, vencidos: 10 },
    { month: 'May', activos: 76, vencidos: 20 },
    { month: 'Jun', activos: 85, vencidos: 7 },
  ],
  totalContracts: 245,
  activeContracts: 185,
  expiringContracts: 15,
  averageContractDuration: "6 meses"
};

const PublicStats = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Enhance grid responsiveness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Add loading skeleton animation */}
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
                {mockData.totalContracts}
              </motion.span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add new metric card */}
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
                transition={{ delay: 0.3 }}
              >
                {mockData.expiringContracts}
              </motion.span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced chart section */}
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
                <BarChart data={mockData.contractStats}>
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