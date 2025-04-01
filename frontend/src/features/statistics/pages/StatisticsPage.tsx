import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatisticsOverviewCard } from '../components/StatisticsOverviewCard';
import { ContractAnalytics } from '../components/ContractAnalytics';
import { ActivityAnalytics } from '../components/ActivityAnalytics';
import { CompanyStatistics } from '../components/CompanyStatistics';
import { ClientContractStatistics } from '../components/ClientContractStatistics';
import { ProviderContractStatistics } from '../components/ProviderContractStatistics';
import { ExpiredContractStatistics } from '../components/ExpiredContractStatistics';
import { SupplementContractStatistics } from '../components/SupplementContractStatistics';
import { NewContractStatistics } from '../components/NewContractStatistics';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { IconDownload } from '@tabler/icons-react';

export function StatisticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Función para manejar el cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Mostrar un mensaje al cambiar de pestaña
    toast({
      title: 'Cargando estadísticas',
      description: `Mostrando estadísticas de ${getTabTitle(value)}`,
      duration: 2000
    });
  };

  // Función para obtener el título de la pestaña
  const getTabTitle = (tabValue: string): string => {
    const titles: Record<string, string> = {
      'overview': 'visión general',
      'contracts': 'contratos',
      'companies': 'empresas',
      'client-contracts': 'contratos de clientes',
      'provider-contracts': 'contratos de proveedores',
      'expired-contracts': 'contratos vencidos',
      'supplement-contracts': 'contratos con suplementos',
      'new-contracts': 'nuevos contratos',
      'activity': 'actividad del sistema'
    };
    
    return titles[tabValue] || tabValue;
  };

  // Función simulada para exportar estadísticas
  const handleExport = () => {
    toast({
      title: 'Exportando datos',
      description: 'Descargando estadísticas en formato PDF...',
      duration: 3000
    });
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
          <Button size="sm" onClick={handleExport} className="gap-1">
            <IconDownload className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Análisis detallado de contratos, empresas y actividad del sistema.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-5 lg:grid-cols-9 h-auto p-1">
          <TabsTrigger value="overview" className="py-2">General</TabsTrigger>
          <TabsTrigger value="contracts" className="py-2">Contratos</TabsTrigger>
          <TabsTrigger value="companies" className="py-2">Empresas</TabsTrigger>
          <TabsTrigger value="client-contracts" className="py-2">Clientes</TabsTrigger>
          <TabsTrigger value="provider-contracts" className="py-2">Proveedores</TabsTrigger>
          <TabsTrigger value="expired-contracts" className="py-2">Vencidos</TabsTrigger>
          <TabsTrigger value="supplement-contracts" className="py-2">Suplementos</TabsTrigger>
          <TabsTrigger value="new-contracts" className="py-2">Nuevos</TabsTrigger>
          <TabsTrigger value="activity" className="py-2">Actividad</TabsTrigger>
        </TabsList>

        {/* Resumen general */}
        <TabsContent value="overview" className="space-y-6">
          <StatisticsOverviewCard />
        </TabsContent>

        {/* Análisis de contratos */}
        <TabsContent value="contracts" className="space-y-6">
          <ContractAnalytics />
        </TabsContent>

        {/* Estadísticas de empresas */}
        <TabsContent value="companies" className="space-y-6">
          <CompanyStatistics />
        </TabsContent>

        {/* Estadísticas de contratos de clientes */}
        <TabsContent value="client-contracts" className="space-y-6">
          <ClientContractStatistics />
        </TabsContent>

        {/* Estadísticas de contratos de proveedores */}
        <TabsContent value="provider-contracts" className="space-y-6">
          <ProviderContractStatistics />
        </TabsContent>

        {/* Estadísticas de contratos vencidos */}
        <TabsContent value="expired-contracts" className="space-y-6">
          <ExpiredContractStatistics />
        </TabsContent>

        {/* Estadísticas de contratos con suplementos */}
        <TabsContent value="supplement-contracts" className="space-y-6">
          <SupplementContractStatistics />
        </TabsContent>

        {/* Estadísticas de nuevos contratos */}
        <TabsContent value="new-contracts" className="space-y-6">
          <NewContractStatistics />
        </TabsContent>

        {/* Análisis de actividad */}
        <TabsContent value="activity" className="space-y-6">
          <ActivityAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
} 