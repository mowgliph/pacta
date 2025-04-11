import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { 
    DollarSign, 
    TrendingUp, 
    AlertTriangle, 
    PlusCircle, 
    FileText, 
    FilePlus,
    History
} from 'lucide-react';
import { fetchStatistics } from '@/renderer/api/electronAPI';
import { motion } from 'framer-motion';

const mockExpiringContracts = [
  { id: '1', name: 'Contrato Alpha', endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
  { id: '2', name: 'Acuerdo Beta Services', endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
  { id: '3', name: 'Proyecto Gamma', endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) },
];

const mockRecentSupplements = [
  { id: 's1', contractId: '1', contractName: 'Contrato Alpha', description: 'Cláusula de confidencialidad añadida', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 's2', contractId: '5', contractName: 'Contrato Epsilon', description: 'Actualización de tarifas', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: 's3', contractId: '2', contractName: 'Acuerdo Beta Services', description: 'Anexo de personal', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
];

const getFormattedDate = (date = new Date()) => {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  try {
      return date.toLocaleDateString('es-ES', options);
  } catch (e) {
      return 'Fecha inválida';
  }
};

const Dashboard = () => {
  const [, navigate] = useLocation();
  const user = useStore((state) => state.user);
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStatistics();
        if (data) setStatsData(data);
      } catch (err) { 
        console.error("Error fetching stats:", err); 
      }
      setIsLoading(false);
    };
    loadStats();
  }, []);

  const StatCard = ({ title, value, description, icon: Icon, colorClass = 'purple' }) => (
    <Card className={`bg-${colorClass}-100 border-${colorClass}-200`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium text-${colorClass}-800`}>{title}</CardTitle>
        {Icon && <Icon className={`h-4 w-4 text-${colorClass}-600`} />}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold text-${colorClass}-900`}>{value}</div>
        <p className={`text-xs text-${colorClass}-700`}>{description}</p>
      </CardContent>
    </Card>
  );

  const ActionButton = ({ text, icon: Icon, onClick, colorClass = 'brand' }) => (
      <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300 }}>
          <Button 
            variant="outline" 
            className={`w-full h-20 flex flex-col items-center justify-center space-y-1 text-center bg-background-card border hover:bg-${colorClass}-light/50 hover:border-${colorClass} group`}
            onClick={onClick}
          >
              <Icon className={`h-6 w-6 mb-1 text-${colorClass === 'brand' ? 'brand-dark' : 'gray-600'} group-hover:scale-110 transition-transform`} />
              <span className={`text-sm font-medium text-${colorClass === 'brand' ? 'brand-dark' : 'text-secondary'}`}>{text}</span>
          </Button>
      </motion.div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-DEFAULT">Dashboard</h1>
        <p className="text-sm text-text-secondary">{user ? `Bienvenido, ${user.username}!` : 'Resumen general'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard 
            title="Contratos Totales" 
            value={isLoading ? '...' : (statsData?.totalContracts ?? 'N/A')} 
            description="Registrados en el sistema"
            icon={FileText}
            colorClass="blue"
          />
          <StatCard 
            title="Contratos Activos" 
            value={isLoading ? '...' : (statsData?.statusCounts?.Active ?? 'N/A')} 
            description="Actualmente vigentes"
            icon={TrendingUp}
            colorClass="green"
          />
        </div>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500"/> 
              Vencen Pronto ({isLoading ? '...' : (statsData?.expiringSoonCount ?? '0')})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-4 py-2 text-sm space-y-2">
            {mockExpiringContracts.length > 0 ? mockExpiringContracts.map(c => (
                <div key={c.id} className="flex justify-between items-center border-b pb-1 last:border-b-0">
                    <span className="text-text-secondary truncate pr-2">{c.name}</span>
                    <span className="text-orange-600 font-medium flex-shrink-0">{getFormattedDate(c.endDate)}</span>
                </div>
            )) : (
                <p className="text-center text-text-light pt-4">Ningún contrato vence pronto.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-text-DEFAULT">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ActionButton text="Nuevo Contrato" icon={PlusCircle} onClick={() => navigate('/contracts/new')} />
          <ActionButton text="Ver Contratos" icon={FileText} onClick={() => navigate('/contracts')} colorClass="gray" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
             <History className="h-5 w-5 mr-2 text-text-secondary"/> 
             Últimos Suplementos Añadidos/Modificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mockRecentSupplements.length > 0 ? (
            <ul className="space-y-3">
              {mockRecentSupplements.map(s => (
                <li key={s.id} className="flex items-start space-x-3 border-b pb-2 last:border-b-0">
                  <FilePlus className="h-4 w-4 mt-1 text-brand-dark flex-shrink-0"/>
                  <div className="flex-1">
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium text-text-DEFAULT">{s.description}</span> para 
                      <Link href={`/contracts/${s.contractId}`} className="text-blue-600 hover:underline ml-1">{s.contractName}</Link>
                    </p>
                    <p className="text-xs text-text-light">{getFormattedDate(s.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-text-light py-4">No hay actividad reciente de suplementos.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;