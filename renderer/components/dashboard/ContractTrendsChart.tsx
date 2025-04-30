import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ContractTrendsChartProps {
  data: {
    [key: string]: {
      total: number;
      client: number;
      supplier: number;
      active: number;
      expired: number;
    };
  };
  isLoading?: boolean;
}

export function ContractTrendsChart({
  data,
  isLoading = false,
}: ContractTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data).map(([month, values]) => ({
    month,
    ...values,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencias de Contratos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                name="Total"
              />
              <Line
                type="monotone"
                dataKey="client"
                stroke="#82ca9d"
                name="Clientes"
              />
              <Line
                type="monotone"
                dataKey="supplier"
                stroke="#ffc658"
                name="Proveedores"
              />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#0088fe"
                name="Activos"
              />
              <Line
                type="monotone"
                dataKey="expired"
                stroke="#ff7300"
                name="Vencidos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
