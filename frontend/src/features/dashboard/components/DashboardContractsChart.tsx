import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

type ContractsByTypeData = {
  client: number;
  provider: number;
  other?: number;
}

type DashboardContractsChartProps = {
  title: string;
  description?: string;
  data: ContractsByTypeData;
  isLoading?: boolean;
  className?: string;
}

export const DashboardContractsChart: React.FC<DashboardContractsChartProps> = ({
  title,
  description,
  data,
  isLoading = false,
  className,
}) => {
  // Colores para el gráfico
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];
  
  // Preparar datos para el gráfico circular
  const chartData = [
    { name: 'Clientes', value: data?.client || 0 },
    { name: 'Proveedores', value: data?.provider || 0 }
  ];
  
  // Si hay otros tipos, añadirlos
  if (data?.other && data.other > 0) {
    chartData.push({ name: 'Otros', value: data.other });
  }
  
  // Calcular el total
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Si está cargando, mostrar esqueleto
  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full animate-pulse bg-muted rounded-md"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} contratos`, 'Cantidad']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                No hay datos disponibles
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 