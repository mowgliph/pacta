import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter'; // Para navegación
import { toast } from '@/renderer/hooks/use-toast'; // Usar el hook de toast
import { contractService } from '@/renderer/services';
import useStore from '@/renderer/store/useStore'; // Importar useStore

// Importa los subcomponentes (asegúrate que las rutas sean correctas)
import ContractList from './contractList';
import ContractForm from './contractForm';
import ContractFilters from './contractFilters';
import ContractDetails from './contractDetails';
import { Button } from "@/renderer/components/ui/button"; // Para el botón de crear
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card"; // Importar Card
import { Loader2, PlusCircle, Plus, Filter } from 'lucide-react'; // Iconos
import { SkeletonTable, SkeletonCard } from '@/renderer/components/ui/skeleton';
import { HoverElevation, HoverScale, HoverGlow, HoverBounce, HoverBackground } from '@/renderer/components/ui/micro-interactions';

const ContractManagement = () => {
  const [, navigate] = useLocation();
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [selectedContract, setSelectedContract] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Obtener rol del usuario
  const userRole = useStore((state) => state.user?.role);
  const canCreate = userRole === 'Admin' || userRole === 'RA';

  // Podríamos añadir estado para el contrato seleccionado si queremos mostrar detalles aquí mismo
  // const [selectedContractId, setSelectedContractId] = useState(null);

  // Función para cargar contratos
  const loadContracts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await contractService.getAllContracts();
      setContracts(data);
      setError(null);
    } catch (err) {
      console.error("Error loading contracts:", err);
      setError('No se pudieron cargar los contratos');
      toast({ title: 'Error', description: 'No se pudieron cargar los contratos', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar contratos al montar y cuando cambien los filtros (si se implementan)
  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const handleCreateContract = async (contractData) => {
    try {
      const result = await contractService.createContract(contractData);
      if (result) {
        toast({ title: 'Éxito', description: 'Contrato creado exitosamente' });
        setIsFormOpen(false);
        loadContracts();
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({ title: 'Error', description: error.message || 'Error al crear el contrato', variant: 'destructive' });
    }
  };

  const handleUpdateContract = async (contractId, contractData) => {
    try {
      const result = await contractService.updateContract(contractId, contractData);
      if (result) {
        toast({ title: 'Éxito', description: 'Contrato actualizado exitosamente' });
        setSelectedContract(null);
        loadContracts();
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      toast({ title: 'Error', description: error.message || 'Error al actualizar el contrato', variant: 'destructive' });
    }
  };

  // --- Lógica para Crear/Actualizar/Eliminar --- 
  // Estas funciones probablemente se pasarán a `ContractList` o `ContractDetails`
  // o se manejarán a través de navegación y modales/formularios dedicados.
  
  const handleDelete = async (id) => {
    // Añadir confirmación aquí si se desea
    const success = await contractService.deleteContract(id);
    if (success) {
      toast({ title: 'Éxito', description: 'Contrato eliminado correctamente.' });
      loadContracts(); // Recargar la lista
    } else {
      toast({ title: 'Error', description: 'No se pudo eliminar el contrato.', variant: 'destructive' });
    }
  };

  // --- Renderizado --- 

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonTable rows={5} columns={4} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  let content;
  if (isLoading) {
    content = (
        <div className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Cargando contratos...</span>
        </div>
    );
  } else if (error) {
    content = <p className="text-red-600 text-center p-4">{error}</p>;
  } else {
    // Pasar canDelete (o el rol) a ContractList
    content = <ContractList contracts={contracts} onDelete={handleDelete} userRole={userRole} />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8" role="main" aria-label="Gestión de contratos">
      <div className="flex justify-between items-center">
        <HoverScale>
          <h1 className="text-2xl font-bold" aria-level="1">Gestión de Contratos</h1>
        </HoverScale>
        <HoverBounce>
          <Button 
            onClick={() => navigate('/contracts/new')}
            className="flex items-center"
            aria-label="Crear nuevo contrato"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nuevo Contrato
          </Button>
        </HoverBounce>
      </div>

      <div className="grid gap-6 md:grid-cols-4" role="region" aria-label="Filtros de contratos">
        <HoverElevation>
          <Card role="article" aria-label="Filtros de búsqueda">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" aria-hidden="true" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-foreground">
                  Buscar
                </label>
                <div className="mt-1">
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Buscar contratos..."
                    aria-label="Buscar contratos"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground">
                  Estado
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Filtrar por estado"
                  >
                    <option value="">Todos</option>
                    <option value="active">Activos</option>
                    <option value="expired">Expirados</option>
                    <option value="pending">Pendientes</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-foreground">
                  Rango de Fechas
                </label>
                <div className="mt-1">
                  <select
                    id="dateRange"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Filtrar por rango de fechas"
                  >
                    <option value="">Todos</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mes</option>
                    <option value="year">Último año</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverElevation>

        <div className="md:col-span-3" role="region" aria-label="Lista de contratos">
          <HoverGlow>
            <Card role="article" aria-label="Tabla de contratos">
              <CardHeader>
                <CardTitle>Contratos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200" role="grid" aria-label="Tabla de contratos">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Inicio
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Fin
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContracts.map((contract) => (
                        <tr key={contract.id} role="row">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{contract.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{contract.client}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              contract.status === 'active' ? 'bg-green-100 text-green-800' :
                              contract.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {contract.status === 'active' ? 'Activo' :
                               contract.status === 'expired' ? 'Expirado' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(contract.startDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(contract.endDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <HoverBackground>
                              <button
                                onClick={() => navigate(`/contracts/${contract.id}`)}
                                className="text-primary hover:text-primary/80"
                                aria-label={`Ver detalles del contrato ${contract.name}`}
                              >
                                Ver Detalles
                              </button>
                            </HoverBackground>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </HoverGlow>
        </div>
      </div>
    </div>
  );
};

export default ContractManagement;