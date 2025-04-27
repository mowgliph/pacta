"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { FileText, AlertCircle, CheckCircle, Activity, Clock, Plus, Search } from "lucide-react";
import { StatCard } from "../../components/dashboard/stat-card";
import { RecentContractsTable } from "../../components/dashboard/recent-contracts-table";
import { ActivityFeed } from "../../components/dashboard/activity-feed";
import { ContractPieChart } from "../../components/dashboard/charts";
import { UpcomingExpirations } from "../../components/dashboard/upcoming-expirations";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/router";
import { useRequireAuth } from "../../hooks/useRequireAuth";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    pendingApproval: 0,
    expiringContracts: 0,
  });
  const [recentContracts, setRecentContracts] = useState([]);
  const [upcomingExpirations, setUpcomingExpirations] = useState([]);
  const [activities, setActivities] = useState([]);
  const { toast } = useToast();
  const currentDate = new Date();
  const router = useRouter();
  const { requireAuth, AuthModal } = useRequireAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Simulamos la carga de datos
      setTimeout(() => {
        setStats({
          totalContracts: 242,
          activeContracts: 187,
          pendingApproval: 12,
          expiringContracts: 25,
        });

        setRecentContracts([
          {
            id: "1",
            title: "Contrato de Servicios IT",
            parties: "ACME Corp, TechSolutions",
            status: "active",
            date: "15/04/2023",
            value: "$45,000.00",
          },
          {
            id: "2",
            title: "Acuerdo de Confidencialidad",
            parties: "GlobalTech, DataSecure",
            status: "pending_approval",
            date: "10/04/2023",
            value: "N/A",
          },
          {
            id: "3",
            title: "Contrato de Arrendamiento",
            parties: "Inmobiliaria XYZ, Empresa ABC",
            status: "draft",
            date: "05/04/2023",
            value: "$12,500.00",
          },
          {
            id: "4",
            title: "Contrato de Distribución",
            parties: "Productos Premium, Distribuidora Nacional",
            status: "active",
            date: "01/04/2023",
            value: "$78,300.00",
          },
          {
            id: "5",
            title: "Acuerdo de Licencia",
            parties: "SoftCorp, Usuario Final",
            status: "expired",
            date: "25/03/2023",
            value: "$35,000.00",
          },
        ]);

        setUpcomingExpirations([
          {
            id: "1",
            title: "Contrato de Servicios IT",
            endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
          },
          {
            id: "2",
            title: "Acuerdo de Confidencialidad",
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
          },
          {
            id: "3",
            title: "Contrato de Mantenimiento",
            endDate: new Date(new Date().setDate(new Date().getDate() + 12)),
          },
        ]);

        setActivities([
          {
            id: "1",
            type: "contract_created",
            description: "Nuevo contrato de servicios creado",
            timestamp: "2023-05-14T10:30:00",
            user: {
              name: "Ana Martínez",
              avatar: "",
            },
            metadata: {
              contractTitle: "Contrato de Servicios IT",
            },
          },
          {
            id: "2",
            type: "contract_updated",
            description: "Actualización de términos y condiciones",
            timestamp: "2023-05-13T15:45:00",
            user: {
              name: "Carlos Rodríguez",
              avatar: "",
            },
            metadata: {
              contractTitle: "Acuerdo de Confidencialidad",
            },
          },
          {
            id: "3",
            type: "contract_approved",
            description: "Contrato aprobado por el departamento legal",
            timestamp: "2023-05-12T09:15:00",
            user: {
              name: "Laura Sánchez",
              avatar: "",
            },
            metadata: {
              contractTitle: "Contrato de Distribución",
            },
          },
        ]);

        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Datos para gráficos
  const statusChartData = [
    {
      name: "Vigentes",
      value: stats.activeContracts,
      color: "#00C49F",
    },
    {
      name: "Próximos a vencer",
      value: stats.expiringContracts,
      color: "#FFBB28",
    },
    {
      name: "Pendientes",
      value: stats.pendingApproval,
      color: "#0088FE",
    },
  ];
  
  const barChartData = [
    { name: "Dom", value: 20, color: "#0088FE" },
    { name: "Lun", value: 25, color: "#00C49F" },
    { name: "Mar", value: 18, color: "#00C49F" },
    { name: "Mié", value: 28, color: "#00C49F" },
    { name: "Jue", value: 23, color: "#00C49F" },
    { name: "Vie", value: 34, color: "#00C49F" },
    { name: "Sáb", value: 30, color: "#00C49F" },
  ];
  
  const handleNewContract = () => {
    requireAuth(() => router.push("/contracts/new"));
  };

  const handleNewSupplement = () => {
    requireAuth(() => router.push("/contracts/supplements/new"));
  };

  const handleSearchContract = () => {
    requireAuth(() => router.push("/contracts?view=search"));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Contratos"
          value={stats.totalContracts.toString()}
          subtitle="Este mes"
          icon={<FileText className="h-6 w-6" />}
          loading={isLoading}
          color="blue"
        />
        <StatCard
          title="Contratos Vigentes"
          value={stats.activeContracts.toString()}
          subtitle="Actualmente"
          icon={<CheckCircle className="h-6 w-6" />}
          loading={isLoading}
          color="green"
        />
        <StatCard
          title="Pendientes de Aprobación"
          value={stats.pendingApproval.toString()}
          subtitle="Requieren revisión"
          icon={<Activity className="h-6 w-6" />}
          loading={isLoading}
          color="indigo"
        />
        <StatCard
          title="Próximos a Vencer"
          value={stats.expiringContracts.toString()}
          subtitle="En 30 días"
          icon={<AlertCircle className="h-6 w-6" />}
          loading={isLoading}
          color="amber"
        />
      </div>
      
      {/* Gráficos y vencimientos */}
      <div className="grid gap-4 md:grid-cols-7">
        <div className="md:col-span-4">
          <Card className="shadow-sm border overflow-hidden">
            <CardHeader className="pb-2 flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-medium">Distribución de Contratos</CardTitle>
                <CardDescription>Visualización por estado</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.push("/reports")}>
                Ver Estadísticas
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-[300px]" />
              ) : (
                <ContractPieChart 
                  data={statusChartData} 
                  title="" 
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card className="shadow-sm border h-full">
            <CardHeader className="pb-3 flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-medium">Contratos por Vencer</CardTitle>
                <CardDescription>Próximos 30 días</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => router.push("/contracts?filter=expiring")}
              >
                Ver Todos
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="w-full h-20" />
                  ))}
                </div>
              ) : (
                <UpcomingExpirations contracts={upcomingExpirations} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Acciones Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Button 
                variant="ghost" 
                size="lg" 
                className="flex flex-col h-24 w-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={handleNewContract}
              >
                <FileText className="h-8 w-8 mb-2 text-blue-500" />
                <span>Nuevo Contrato</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Button 
                variant="ghost" 
                size="lg" 
                className="flex flex-col h-24 w-full hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={handleNewSupplement}
              >
                <Plus className="h-8 w-8 mb-2 text-green-500" />
                <span>Nuevo Suplemento</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Button 
                variant="ghost" 
                size="lg" 
                className="flex flex-col h-24 w-full hover:bg-purple-50 dark:hover:bg-purple-900/20"
                onClick={handleSearchContract}
              >
                <Search className="h-8 w-8 mb-2 text-purple-500" />
                <span>Buscar Contrato</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Button 
                variant="ghost" 
                size="lg" 
                className="flex flex-col h-24 w-full hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => router.push("/reports")}
              >
                <Activity className="h-8 w-8 mb-2 text-amber-500" />
                <span>Ver Estadísticas</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Actividad reciente */}
      <div className="grid gap-4">
        <Card className="shadow-sm border">
          <CardHeader className="pb-3 flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Ver Todo
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="w-full h-12" />
                ))}
              </div>
            ) : (
              <ActivityFeed activities={activities} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de autenticación */}
      <AuthModal />
    </div>
  );
}
