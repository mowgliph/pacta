import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/renderer/components/ui/card";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import { 
    TrendingUp, 
    AlertTriangle, 
    PlusCircle, 
    FileText, 
    ListChecks,
    History,
    FilePlus,
    BarChart3,
    FileUp,
    Download,
    Settings,
    Shield,
    Calendar,
    LucideIcon
} from 'lucide-react';
import statisticsService from '@/renderer/services/statisticsService';
import { motion } from 'framer-motion';
import { SkeletonCard, SkeletonList, SkeletonChart } from '@/renderer/components/ui/skeleton';
import { HoverElevation, HoverGlow, HoverBounce, HoverBackground } from '@/renderer/components/ui/micro-interactions';
import NotificationPanel from '../components/NotificationPanel';
import NotificationPreferences from '../components/NotificationPreferences';
import SystemHealthPanel from '../components/SystemHealthPanel';

interface ExpiringContract {
  id: string;
  name: string;
  endDate: Date;
}

interface Supplement {
  id: string;
  contractId: string;
  contractName: string;
  description: string;
  date: Date;
}

interface StatsData {
  totalContracts: number | string;
  statusCounts: {
    Active: number | string;
    Pending?: number;
    Expired?: number;
  };
  expiringSoonCount?: number;
  expiringContracts?: ExpiringContract[];
  recentSupplements?: Supplement[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  colorClass?: string;
}

interface ActionButtonProps {
  text: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

const mockExpiringContracts: ExpiringContract[] = [
  { id: '1', name: 'Contrato Alpha', endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
  { id: '2', name: 'Acuerdo Beta Services', endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
  { id: '3', name: 'Proyecto Gamma', endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) },
];

const mockRecentSupplements: Supplement[] = [
  { id: 's1', contractId: '1', contractName: 'Contrato Alpha', description: 'Cláusula de confidencialidad añadida', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 's2', contractId: '5', contractName: 'Contrato Epsilon', description: 'Actualización de tarifas', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: 's3', contractId: '2', contractName: 'Acuerdo Beta Services', description: 'Anexo de personal', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
];

const getFormattedDate = (date: Date): string => {
   if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
       return 'Fecha inválida';
   }
   try {
       const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
       return utcDate.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
   } catch (e) {
       console.error("Error formatting date:", e);
       return 'Fecha inválida';
   }
};

const Dashboard: React.FC = () => {
  const [, navigate] = useLocation();
  const user = useStore((state) => state.user);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const stats = await statisticsService.getGeneralStatistics();
        setStatsData({
          totalContracts: stats.totalContracts || 0,
          statusCounts: { 
            Active: stats.activeContracts || 0,
            Pending: stats.pendingContracts || 0,
            Expired: stats.expiredContracts || 0 
          },
          expiringSoonCount: stats.expiringContracts || 0,
          expiringContracts: stats.expiringContractsList || [],
          recentSupplements: stats.recentSupplements || []
        });
      } catch (err) { 
        console.error("Error fetching stats, using mock data:", err);
        setStatsData({
            totalContracts: 15,
            statusCounts: { Active: 10, Pending: 3, Expired: 2 },
            expiringSoonCount: mockExpiringContracts.length,
            expiringContracts: mockExpiringContracts.map(c => ({...c, endDate: new Date(c.endDate)})),
            recentSupplements: mockRecentSupplements.map(s => ({...s, date: new Date(s.date)}))
        });
      }
      setIsLoading(false);
    };
    loadStats();
  }, []);

  const { 
      totalContracts = 'N/A',
      statusCounts = { Active: 'N/A' },
      expiringSoonCount = 0
  } = statsData || {};
  
  const expiringContracts = statsData?.expiringContracts || mockExpiringContracts;
  const recentSupplements = statsData?.recentSupplements || mockRecentSupplements;
  const finalExpiringSoonCount = statsData?.expiringSoonCount ?? expiringContracts.length;

  const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, colorClass = 'blue' }) => (
    <HoverElevation>
      <Card className={`border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-300 bg-card/95 backdrop-blur-sm`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <h3 className="text-2xl font-bold text-foreground">{value}</h3>
              {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
            {Icon && <div className="p-2 rounded-full bg-primary/10"><Icon className="h-6 w-6 text-primary" /></div>}
          </div>
        </CardContent>
      </Card>
    </HoverElevation>
  );

  const ActionButton: React.FC<ActionButtonProps> = ({ text, icon: Icon, onClick, variant = 'default' }) => (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
      <Button 
        variant={variant}
        className="w-full h-full p-4 flex flex-col items-center justify-center space-y-2 text-center shadow-sm hover:shadow-md transition-all duration-300 bg-card/95 backdrop-blur-sm"
        onClick={onClick}
      >
        <div className="p-2 rounded-full bg-primary/10 mb-1">
          <Icon className="h-4 w-4 text-primary transition-transform duration-150" />
        </div>
        <span className="text-xs font-medium">{text}</span>
      </Button>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-8 bg-background">
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <SkeletonChart />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <SkeletonList count={3} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background relative overflow-hidden">
      {/* Fondo con gradiente sutil */}
      <div className="absolute -z-10 top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-background"></div>
      
      {/* Encabezado con saludo */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative">
          <div className="absolute -z-10 top-0 left-1/4 w-1/2 h-24 bg-primary/5 blur-3xl rounded-full"></div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            {user ? `¡Hola, ${user.name}!` : 'Dashboard'}
            <div className="ml-2 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Resumen general del sistema de gestión de contratos
          </p>
        </div>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <StatCard 
          title="Contratos Totales" 
          value={totalContracts} 
          icon={FileText}
          colorClass="primary"
        />
        <StatCard 
          title="Contratos Activos" 
          value={statusCounts.Active} 
          icon={TrendingUp}
          colorClass="primary"
        />
        <StatCard 
          title="Próximos a Vencer" 
          value={finalExpiringSoonCount} 
          icon={Calendar}
          colorClass="primary"
        />
      </motion.div>

      {/* Panel de acciones rápidas */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <PlusCircle className="h-3 w-3 text-primary" />
          </div>
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <HoverGlow>
            <ActionButton text="Nuevo Contrato" icon={PlusCircle} onClick={() => navigate('/contracts/new')} />
          </HoverGlow>
          <HoverGlow>
            <ActionButton text="Ver Contratos" icon={ListChecks} onClick={() => navigate('/contracts')} />
          </HoverGlow>
          <HoverGlow>
            <ActionButton text="Estadísticas" icon={BarChart3} onClick={() => navigate('/advanced-statistics')} />
          </HoverGlow>
          <HoverGlow>
            <ActionButton text="Añadir Suplemento" icon={FilePlus} onClick={() => navigate('/contracts')} />
          </HoverGlow>
          <HoverGlow>
            <ActionButton text="Backup" icon={Download} onClick={() => navigate('/settings')} />
          </HoverGlow>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        {/* Gráfico y estadísticas */}
        <div className="lg:col-span-2 space-y-6">
          <HoverGlow>
            <Card className="shadow-sm bg-card/95 backdrop-blur-sm border border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <div className="p-2 rounded-full bg-primary/10 mr-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  Distribución de Contratos
                </CardTitle>
                <CardDescription>Resumen por estado y tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {/* Aquí iría el componente de gráfico real */}
                  <div className="text-center w-full">
                    <div className="flex justify-center space-x-4 mb-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                        <span className="text-xs">Activos (65%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                        <span className="text-xs">Pendientes (20%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-300 mr-2"></div>
                        <span className="text-xs">Vencidos (15%)</span>
                      </div>
                    </div>
                    <div className="w-full h-32 bg-muted/20 rounded-lg flex items-end px-4">
                      <div className="w-1/4 h-[65%] bg-primary rounded-t-md mx-1"></div>
                      <div className="w-1/4 h-[20%] bg-blue-400 rounded-t-md mx-1"></div>
                      <div className="w-1/4 h-[15%] bg-blue-300 rounded-t-md mx-1"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </HoverGlow>

          <HoverGlow>
            <Card className="shadow-sm bg-card/95 backdrop-blur-sm border border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <div className="p-2 rounded-full bg-primary/10 mr-2">
                    <History className="h-4 w-4 text-primary" />
                  </div>
                  Actividad Reciente
                </CardTitle>
                <CardDescription>Últimos suplementos añadidos</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSupplements.length > 0 ? (
                  <ul className="space-y-3">
                    {recentSupplements.slice(0, 4).map(s => (
                      <HoverBackground key={s.id}>
                        <li className="flex items-start space-x-3 border-b pb-2 last:border-b-0 rounded-md p-2">
                          <div className="p-1.5 rounded-full bg-primary/10 flex-shrink-0">
                            <FilePlus className="h-3 w-3 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm leading-snug">
                              <span className="font-medium">{s.description || 'Descripción no disponible'}</span> para el contrato 
                              <Link href={`/contracts/${s.contractId}`}>
                                <a className="text-primary hover:underline ml-1 font-medium">{s.contractName || `ID ${s.contractId}`}</a>
                              </Link>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{getFormattedDate(s.date)}</p>
                          </div>
                        </li>
                      </HoverBackground>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">No hay actividad reciente de suplementos.</p>
                )}
              </CardContent>
            </Card>
          </HoverGlow>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          <HoverGlow>
            <SystemHealthPanel />
          </HoverGlow>

          <HoverBounce>
            <Card className="shadow-sm border-l-4 border-l-primary bg-card/95 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <div className="p-2 rounded-full bg-primary/10 mr-2">
                    <AlertTriangle className="h-4 w-4 text-primary"/> 
                  </div>
                  Contratos por Vencer
                </CardTitle>
                <CardDescription>Próximos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                  {expiringContracts.length > 0 ? expiringContracts.map(c => (
                    <HoverBackground key={c.id}>
                      <Link href={`/contracts/${c.id}`}>
                        <a className="flex justify-between items-center border-b py-2 px-2 last:border-b-0 hover:bg-accent/50 rounded-md transition-colors cursor-pointer">
                          <div className="flex items-center">
                            <div className="p-1.5 rounded-full bg-primary/10 mr-2">
                              <Calendar className="h-3 w-3 text-primary" />
                            </div>
                            <span className="font-medium text-sm">{c.name}</span>
                          </div>
                          <span className="text-xs text-primary px-2 py-1 bg-primary/5 rounded-full">{getFormattedDate(c.endDate)}</span>
                        </a>
                      </Link>
                    </HoverBackground>
                  )) : (
                    <p className="text-center text-muted-foreground py-4 text-sm">No hay contratos próximos a vencer.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </HoverBounce>

          <HoverGlow>
            <Card className="shadow-sm bg-card/95 backdrop-blur-sm border border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <div className="p-2 rounded-full bg-primary/10 mr-2">
                    <Settings className="h-4 w-4 text-primary"/> 
                  </div>
                  Configuración Rápida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-sm bg-card hover:bg-primary/5" onClick={() => navigate('/settings')}>
                    <div className="p-1.5 rounded-full bg-primary/10 mr-2">
                      <Settings className="h-3 w-3 text-primary" />
                    </div>
                    Configuración del Sistema
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm bg-card hover:bg-primary/5" onClick={() => navigate('/user-profile')}>
                    <div className="p-1.5 rounded-full bg-primary/10 mr-2">
                      <FileUp className="h-3 w-3 text-primary" />
                    </div>
                    Gestionar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </HoverGlow>

          <HoverGlow>
            <NotificationPanel />
          </HoverGlow>

          <HoverGlow>
            <NotificationPreferences />
          </HoverGlow>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;