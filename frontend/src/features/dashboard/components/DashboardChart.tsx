import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { IconLock } from '@tabler/icons-react';

interface DashboardChartProps {
  title: string;
  description?: string;
  data: {
    labels: string[];
    data: number[];
  };
  isLoading?: boolean;
  isPublic?: boolean;
  onRequireAuth?: () => void;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  description,
  data,
  isLoading = false,
  isPublic = false,
  onRequireAuth,
}) => {
  // Preparar datos para el gráfico
  const chartData = data?.labels.map((label, index) => ({
    name: label,
    value: data.data[index],
  })) || [];

  // Si está cargando, mostrar esqueleto
  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse bg-muted rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs text-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs text-muted-foreground"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '6px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorValue)"
                activeDot={{ r: 8 }}
                animationDuration={1000}
                className="transition-all duration-300"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      {isPublic && onRequireAuth && (
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between"
            onClick={onRequireAuth}
          >
            <span>Ver estadísticas detalladas</span>
            <IconLock className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}; 