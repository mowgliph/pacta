import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from '@/renderer/hooks/use-toast';
import { useContracts } from '@/renderer/hooks/useContracts';
import ContractFilters from './contractFilters';
import VirtualizedContractTable from '@/renderer/components/VirtualizedContractTable';
import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Plus, Filter } from 'lucide-react';
import { HoverElevation, HoverScale, HoverGlow } from '@/renderer/components/ui/micro-interactions';
import LoadingState from '@/renderer/components/LoadingState';
import ErrorState from '@/renderer/components/ErrorState';
import type { Contract, ContractFilters as IContractFilters } from '@/renderer/types/contracts';
import useStore from '@/renderer/store/useStore';

const ContractsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const {
    contracts,
    loading,
    error,
    fetchContracts,
    handleView,
    handleEdit,
    handleDelete
  } = useContracts();

  const [filters, setFilters] = useState<IContractFilters>({
    status: '',
    clientName: '',
    startDate: '',
    endDate: ''
  });

  const userRole = useStore((state) => state.user?.role);
  const canCreate = userRole === 'Admin' || userRole === 'RA';

  const handleFilterChange = (newFilters: IContractFilters) => {
    setFilters(newFilters);
    fetchContracts(newFilters);
  };

  const handleTableEdit = async (contract: Contract) => {
    handleView(contract);
  };

  if (loading) {
    return <LoadingState message="Cargando contratos..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchContracts(filters)} />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8" role="main" aria-label="Gestión de contratos">
      <div className="flex justify-between items-center">
        <HoverScale>
          <h1 className="text-2xl font-bold">Gestión de Contratos</h1>
        </HoverScale>
        {canCreate && (
          <HoverGlow>
            <Button 
              onClick={() => navigate('/contracts/new')}
              className="flex items-center"
              aria-label="Crear nuevo contrato"
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Nuevo Contrato
            </Button>
          </HoverGlow>
        )}
      </div>

      <HoverElevation>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" aria-hidden="true" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContractFilters onFilterChange={handleFilterChange} />
          </CardContent>
        </Card>
      </HoverElevation>

      <Card>
        <CardHeader>
          <CardTitle>Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron contratos</p>
            </div>
          ) : (
            <VirtualizedContractTable
              contracts={contracts}
              onView={handleView}
              onEdit={handleTableEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractsPage;