import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

// Datos de ejemplo para el gráfico
const data = [
  {
    name: "Ene",
    total: 18,
  },
  {
    name: "Feb",
    total: 22,
  },
  {
    name: "Mar",
    total: 30,
  },
  {
    name: "Abr",
    total: 25,
  },
  {
    name: "May",
    total: 33,
  },
  {
    name: "Jun",
    total: 28,
  },
  {
    name: "Jul",
    total: 40,
  },
];

type OverviewProps = {
  className?: string;
}

export function Overview({ className }: OverviewProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Resumen de Contratos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Bar
              dataKey="total"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 