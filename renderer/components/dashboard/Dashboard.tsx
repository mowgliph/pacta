'use client';

import { useEffect, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertCircle, Calendar, CheckCircle, FileText, ListFilter, Plus, UserCheck, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { StatCard } from './stat-card';
import { RecentContractsTable } from './recent-contracts-table';
import { UpcomingExpirations } from './upcoming-expirations';
import apiClient from '../../lib/api-client';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';
import { ContractBarChart, ContractPieChart, ActivityFeed } from './charts';

// Colores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const STATUS_COLORS = {
  active: '#10B981',
  expiring_soon: '#F59E0B',
  expired: '#EF4444',
  archived: '#6B7280',
};

// Tipos
interface DashboardSummary {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  recentActivity: number;
}

interface ContractByStatus {
  status: string;
  count: number;
}

interface ContractByType {
  type: string;
  count: number;
}

interface ActivityItem {
  id: string;
  title: string;
  type: 'creation' | 'modification' | 'approval' | 'expiration';
  date: string;
  description: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('status');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [byStatus, setByStatus] = useState<ContractByStatus[]>([]);
  const [byType, setByType] = useState<ContractByType[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para cargar todos los datos del dashboard
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadSummary(),
          loadByStatus(),
          loadByType(),
          loadActivity()
        ]);
      } catch (error) {
        console.error('Error cargando datos del dashboard', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Cargar resumen
  const loadSummary = async () => {
    try {
      const data = await apiClient.get<DashboardSummary>('/api/dashboard/summary');
      setSummary(data);
    } catch (error) {
      console.error('Error cargando resumen', error);
    }
  };

  // Cargar datos por estado
  const loadByStatus = async () => {
    try {
      const data = await apiClient.get<ContractByStatus[]>('/api/dashboard/by-status');
      setByStatus(data);
    } catch (error) {
      console.error('Error cargando datos por estado', error);
    }
  };

  // Cargar datos por tipo
  const loadByType = async () => {
    try {
      const data = await apiClient.get<ContractByType[]>('/api/dashboard/by-type');
      setByType(data);
    } catch (error) {
      console.error('Error cargando datos por tipo', error);
    }
  };

  // Cargar actividad reciente
  const loadActivity = async () => {
    try {
      const data = await apiClient.get<ActivityItem[]>('/api/dashboard/activity');
      // Asegurar que los tipos son compatibles
      const typedActivities: ActivityItem[] = data.map(item => ({
        ...item,
        type: item.type as 'creation' | 'modification' | 'approval' | 'expiration'
      }));
      setActivity(typedActivities);
    } catch (error) {
      console.error('Error cargando actividad reciente', error);
    }
  };

  // Transformar datos para gráficos
  const statusChartData = byStatus.map(item => ({
    name: {
      'active': 'Vigentes',
      'expiring_soon': 'Próximos a vencer',
      'expired': 'Vencidos',
      'archived': 'Archivados',
    }[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#6B7280',
  }));
  
  const typeChartData = byType.map(item => ({
    name: item.type,
    value: item.count,
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/contracts/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contrato
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Contratos"
          value={summary?.totalContracts?.toString() || "0"}
          icon={<FileText className="h-6 w-6" />}
          loading={loading}
        />
        <StatCard
          title="Contratos Vigentes"
          value={summary?.activeContracts?.toString() || "0"}
          trend={{ value: 0, label: "vs mes anterior" }}
          icon={<CheckCircle className="h-6 w-6" />}
          loading={loading}
          color="green"
        />
        <StatCard
          title="Próximos a Vencer"
          value={summary?.expiringContracts?.toString() || "0"}
          trend={{ value: 0, label: "vs mes anterior" }}
          icon={<AlertCircle className="h-6 w-6" />}
          loading={loading}
          color="amber"
        />
        <StatCard
          title="Actividad Reciente"
          value={summary?.recentActivity?.toString() || "0"}
          trend={{ value: 0, label: "últimos 7 días" }}
          icon={<Activity className="h-6 w-6" />}
          loading={loading}
          subtitle="últimos 7 días"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Distribución de Contratos</CardTitle>
            <CardDescription>
              Visualización gráfica de los contratos por estado y tipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="status">Por Estado</TabsTrigger>
                <TabsTrigger value="type">Por Tipo</TabsTrigger>
              </TabsList>
              <TabsContent value="status" className="h-[300px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="animate-spin text-primary">
                      <svg
                        className="h-8 w-8"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} contratos`, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
              <TabsContent value="type" className="h-[300px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="animate-spin text-primary">
                      <svg
                        className="h-8 w-8"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={typeChartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} contratos`, 'Cantidad']} />
                      <Legend />
                      <Bar dataKey="value" name="Cantidad" fill="#8884d8">
                        {typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" asChild>
              <Link href="/statistics">
                <Activity className="mr-2 h-4 w-4" />
                Ver estadísticas avanzadas
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Próximos a Vencer</CardTitle>
            <CardDescription>
              Contratos que vencerán en los próximos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingExpirations 
              contracts={[]} // Corregir pasando un array vacío temporalmente
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" asChild>
              <Link href="/contracts?status=expiring_soon">
                <Calendar className="mr-2 h-4 w-4" />
                Ver todos
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Contratos Recientes</CardTitle>
            <CardDescription>
              Últimos contratos agregados o modificados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentContractsTable 
              contracts={[]} // Corregir pasando un array vacío temporalmente
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" asChild>
              <Link href="/contracts">
                <ListFilter className="mr-2 h-4 w-4" />
                Todos los contratos
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="w-full h-16" />
                ))}
              </div>
            ) : (
              <ActivityFeed activities={activity} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}