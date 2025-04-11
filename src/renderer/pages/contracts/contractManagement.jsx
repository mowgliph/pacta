import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter'; // Para navegación
import { toast } from '@/renderer/hooks/use-toast'; // Usar el hook de toast
import {
  fetchContracts,
  createContract,
  updateContract,
  deleteContract,
  fetchContractDetails // Aunque se use en ContractDetails, lo preparamos
} from '@/renderer/api/electronAPI'; // Importa las funciones API correctas

// Importa los subcomponentes (asegúrate que las rutas sean correctas)
import ContractList from './contractList';
import ContractForm from './contractForm';
import ContractFilters from './contractFilters';
import ContractDetails from './contractDetails';
import { Button } from "@/renderer/components/ui/button"; // Para el botón de crear

const ContractManagement = () => {
  const [, navigate] = useLocation();
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Mantendremos los filtros simples por ahora, la lógica de filtrado real iría aquí o en el backend
  const [filters, setFilters] = useState({});

  // Podríamos añadir estado para el contrato seleccionado si queremos mostrar detalles aquí mismo
  // const [selectedContractId, setSelectedContractId] = useState(null);

  // Función para cargar contratos
  const loadContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Aquí podrías pasar los `filters` si la API los soporta
      const fetchedContracts = await fetchContracts(/* filters */);
      setContracts(fetchedContracts || []);
    } catch (err) {
      console.error("Error loading contracts:", err);
      setError('No se pudieron cargar los contratos.');
      toast({ title: 'Error', description: 'No se pudieron cargar los contratos.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [/* filters */]); // Dependencia de los filtros si se usan

  // Cargar contratos al montar y cuando cambien los filtros (si se implementan)
  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  // --- Lógica para Crear/Actualizar/Eliminar --- 
  // Estas funciones probablemente se pasarán a `ContractList` o `ContractDetails`
  // o se manejarán a través de navegación y modales/formularios dedicados.
  
  const handleDelete = async (id) => {
    // Añadir confirmación aquí si se desea
    const success = await deleteContract(id);
    if (success) {
      toast({ title: 'Éxito', description: 'Contrato eliminado correctamente.' });
      loadContracts(); // Recargar la lista
    } else {
      toast({ title: 'Error', description: 'No se pudo eliminar el contrato.', variant: 'destructive' });
    }
  };

  // --- Renderizado --- 

  let content;
  if (isLoading) {
    content = <div className="text-center p-4">Cargando contratos...</div>;
  } else if (error) {
    content = <div className="text-center p-4 text-red-600">{error}</div>;
  } else {
    // Pasa los contratos y la función de eliminar a ContractList
    content = <ContractList contracts={contracts} onDelete={handleDelete} />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Contratos</h1>
        {/* Botón para navegar a la página/modal de creación */}
        <Button onClick={() => navigate('/contracts/new')}>Crear Nuevo Contrato</Button>
      </div>

      {/* Filtros (si se implementan) */}
      {/* <ContractFilters filters={filters} onFilterChange={setFilters} /> */}

      {/* Contenido: Lista o estado de carga/error */}
      <div className="mt-4">
        {content}
      </div>

      {/* Aquí podrías tener lógica para mostrar un modal de creación/edición 
          o manejar rutas anidadas para /contracts/new, /contracts/:id/edit */} 
      {/* Ejemplo: <Route path="/contracts/new"><ContractForm onSubmit={handleCreate} /></Route> */}
      {/* Ejemplo: <Route path="/contracts/:id/edit"><ContractForm contractId={params.id} onSubmit={handleUpdate} /></Route> */}

    </div>
  );
};

export default ContractManagement;