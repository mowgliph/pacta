import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { 
    DollarSign, 
    TrendingUp, 
    AlertTriangle, 
    PlusCircle, 
    FileText, 
    ListChecks,
    History,
    FilePlus,
    LucideIcon
} from 'lucide-react';
import { statisticsService } from '@/renderer/services';
import { motion } from 'framer-motion';
import { SkeletonCard, SkeletonList, SkeletonChart } from '@/renderer/components/ui/skeleton';
import { HoverElevation, HoverScale, HoverGlow, HoverBounce } from '@/renderer/components/ui/micro-interactions';

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
        setStatsData(stats);
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

  const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, colorClass = 'purple' }) => (
    <HoverElevation>
      <HoverGlow>
        <Card className={`bg-${colorClass}-50 border-${colorClass}-200 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium text-${colorClass}-700 dark:text-${colorClass}-300`}>{title}</CardTitle>
            {Icon && <Icon className={`h-4 w-4 text-${colorClass}-500 dark:text-${colorClass}-400`} />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-${colorClass}-800 dark:text-${colorClass}-200`}>{value}</div>
            {description && <p className={`text-xs text-${colorClass}-600 dark:text-${colorClass}-400`}>{description}</p>}
          </CardContent>
        </Card>
      </HoverGlow>
    </HoverElevation>
  );

  const ActionButton: React.FC<ActionButtonProps> = ({ text, icon: Icon, onClick }) => (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
        <Button 
          variant="outline" 
          className="w-full h-full p-4 flex flex-col items-center justify-center space-y-1 text-center bg-card border hover:bg-accent hover:border-brand/50 group shadow-sm hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
          onClick={onClick}
        >
            <Icon className="h-7 w-7 mb-1 text-brand group-hover:scale-110 transition-transform duration-150 dark:text-brand-light" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors dark:group-hover:text-white">{text}</span>
        </Button>
    </motion.div>
  );

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-8 p-4 md:p-6 lg:p-8 bg-background text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Contratos Próximos a Vencer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SkeletonList count={3} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SkeletonList count={3} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonChart />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonChart />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
        className="space-y-8 p-4 md:p-6 lg:p-8 bg-background text-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <HoverScale>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </HoverScale>
        <p className="text-sm text-muted-foreground">{user ? `Bienvenido de nuevo, ${user.username}!` : 'Resumen general del sistema'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard 
            title="Contratos Totales" 
            value={totalContracts} 
            description="Registrados en el sistema"
            icon={FileText}
            colorClass="blue"
          />
          <StatCard 
            title="Contratos Activos" 
            value={statusCounts.Active} 
            description="Actualmente vigentes"
            icon={TrendingUp}
            colorClass="green"
          />
        </div>
        
        <div className="space-y-6">
          <HoverBounce>
            <Card className="shadow-sm bg-card dark:bg-gray-800 border dark:border-gray-700">
              <CardHeader className="border-b pb-3 dark:border-gray-600">
                <CardTitle className="flex items-center text-base font-semibold text-foreground">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500"/> 
                  Vencen Pronto ({finalExpiringSoonCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-60 px-4 py-2 text-sm space-y-2 mt-2 custom-scrollbar">
                {expiringContracts.length > 0 ? expiringContracts.map(c => (
                  <HoverBackground key={c.id}>
                    <Link href={`/contracts/${c.id}`}>
                      <a className="flex justify-between items-center border-b pb-1.5 last:border-b-0 hover:bg-accent dark:hover:bg-gray-700 p-1 rounded transition-colors cursor-pointer dark:border-gray-700">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground">{getFormattedDate(c.endDate)}</span>
                      </a>
                    </Link>
                  </HoverBackground>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No hay contratos próximos a vencer.</p>
                )}
              </CardContent>
            </Card>
          </HoverBounce>

          <HoverBounce>
            <Card className="shadow-sm bg-card dark:bg-gray-800 border dark:border-gray-700">
              <CardHeader className="border-b pb-3 dark:border-gray-600">
                <CardTitle className="flex items-center text-base font-semibold text-foreground">
                  <History className="h-5 w-5 mr-2 text-muted-foreground"/> 
                  Actividad Reciente (Suplementos)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {recentSupplements.length > 0 ? (
                  <ul className="space-y-3">
                    {recentSupplements.slice(0, 5).map(s => (
                      <HoverBackground key={s.id}>
                        <li className="flex items-start space-x-3 border-b pb-2 last:border-b-0 dark:border-gray-700">
                          <FilePlus className="h-4 w-4 mt-0.5 text-brand dark:text-brand-light flex-shrink-0"/>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground leading-snug">
                              <span className="font-medium text-foreground">{s.description || 'Descripción no disponible'}</span> para el contrato 
                              <Link href={`/contracts/${s.contractId}`}>
                                <a className="text-blue-600 hover:underline ml-1 font-medium dark:text-blue-400">{s.contractName || `ID ${s.contractId}`}</a>
                              </Link>
                            </p>
                            <p className="text-xs text-muted-foreground/80 mt-0.5">{getFormattedDate(s.date)}</p>
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
          </HoverBounce>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <ActionButton text="Nuevo Contrato" icon={PlusCircle} onClick={() => navigate('/contracts/new')} />
          <ActionButton text="Ver Contratos" icon={ListChecks} onClick={() => navigate('/contracts')} />
        </div>
      </div>

    </motion.div>
  );
};

export default Dashboard;