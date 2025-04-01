import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type StatisticsChartCardProps = {
  title: string;
  description: string;
  data: any[];
  isLoading?: boolean;
  xAxisKey?: string;
  lines?: Array<{dataKey: string; name: string; color: string}>;
  bars?: Array<{dataKey: string; name: string; color: string}>;
  showSelect?: boolean;
  selectOptions?: Array<{value: string; label: string}>;
  onSelectChange?: (value: string) => void;
}

export function StatisticsChartCard({
  title,
  description,
  data,
  isLoading = false,
  xAxisKey = 'name',
  lines = [],
  bars = [],
  showSelect = false,
  selectOptions = [],
  onSelectChange,
}: StatisticsChartCardProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {showSelect && selectOptions.length > 0 && (
            <Select
              defaultValue={selectOptions[0].value}
              onValueChange={onSelectChange}
            >
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Tabs defaultValue="line" className="w-[160px]" onValueChange={(value) => setChartType(value as 'line' | 'bar')}>
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger value="line">Línea</TabsTrigger>
              <TabsTrigger value="bar">Barra</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={xAxisKey} 
                    fontSize={12}
                    tick={{ fill: '#888888' }}
                  />
                  <YAxis
                    fontSize={12}
                    tick={{ fill: '#888888' }}
                  />
                  <Tooltip />
                  <Legend />
                  {lines.map((line) => (
                    <Line
                      key={line.dataKey}
                      type="monotone"
                      dataKey={line.dataKey}
                      name={line.name}
                      stroke={line.color}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={xAxisKey} 
                    fontSize={12}
                    tick={{ fill: '#888888' }}
                  />
                  <YAxis
                    fontSize={12}
                    tick={{ fill: '#888888' }}
                  />
                  <Tooltip />
                  <Legend />
                  {bars.map((bar) => (
                    <Bar
                      key={bar.dataKey}
                      dataKey={bar.dataKey}
                      name={bar.name}
                      fill={bar.color}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 