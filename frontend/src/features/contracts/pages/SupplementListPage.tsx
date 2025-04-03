import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { useContract, useContractSupplements } from '../hooks/useContracts';
import { Plus, Search, RefreshCw, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SupplementListPageProps = {
  contractId: string;
  isPublic?: boolean;
};

/**
 * Página para listar los suplementos de un contrato
 */
export default function SupplementListPage({ contractId, isPublic = false }: SupplementListPageProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cargar datos del contrato y sus suplementos
  const { data: contract, isLoading: isLoadingContract } = useContract(contractId);
  const { 
    data: supplements, 
    isLoading: isLoadingSupplements, 
    error: supplementsError,
    mutate: refreshSupplements 
  } = useContractSupplements(contractId);
  
  // Filtrar suplementos por término de búsqueda
  const filteredSupplements = supplements?.filter(supplement => 
    supplement.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (supplement.description && supplement.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];
  
  // Navegar a la página de crear suplemento
  const handleCreateSupplement = () => {
    navigate(`/contracts/${contractId}/supplements/new`);
  };
  
  // Navegar a la página de detalles del suplemento
  const handleViewSupplement = (id: string) => {
    navigate(`/contracts/${contractId}/supplements/${id}`);
  };
  
  // Volver a la página de detalles del contrato
  const handleBack = () => {
    navigate(`/contracts/${contractId}`);
  };
  
  // Refrescar la lista de suplementos
  const handleRefresh = () => {
    refreshSupplements();
  };
  
  // Si está cargando, mostrar un esqueleto
  if (isLoadingContract || isLoadingSupplements) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cargando suplementos..."
          backButton={true}
          backPath={`/contracts/${contractId}`}
        />
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-10 bg-muted rounded w-full mt-4"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Si hay error o no se encuentra el contrato
  if (!contract) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Error al cargar contrato"
          backButton={true}
          backPath="/contracts"
        />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">No se pudo cargar la información del contrato</p>
            <Button onClick={() => navigate('/contracts')}>Volver a la lista de contratos</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Suplementos"
        description={`Contrato: ${contract.name}`}
        backButton={true}
        backPath={`/contracts/${contractId}`}
        actions={
          !isPublic && (
            <Button 
              onClick={handleCreateSupplement}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo suplemento
            </Button>
          )
        }
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de suplementos</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoadingSupplements}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingSupplements ? 'animate-spin' : ''}`} />
            <span className="ml-2">Actualizar</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar suplementos..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filteredSupplements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay suplementos que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSupplements.map((supplement) => (
                <div 
                  key={supplement.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleViewSupplement(supplement.id)}
                >
                  <div>
                    <h3 className="font-medium">{supplement.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {new Date(supplement.effectiveDate).toLocaleDateString()}
                      </Badge>
                      {supplement.documentUrl && (
                        <Badge variant="secondary" className="text-xs">
                          Con documento
                        </Badge>
                      )}
                    </div>
                    {supplement.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {supplement.description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(supplement.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 