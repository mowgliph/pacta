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
import useStore from '@/renderer/store/useStore'; // Importar useStore

// Importa los subcomponentes (asegúrate que las rutas sean correctas)
import ContractList from './contractList';
import ContractForm from './contractForm';
import ContractFilters from './contractFilters';
import ContractDetails from './contractDetails';
import { Button } from "@/renderer/components/ui/button"; // Para el botón de crear
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card"; // Importar Card
import { Loader2, PlusCircle } from 'lucide-react'; // Iconos

const ContractManagement = () => {
  const [, navigate] = useLocation();
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Mantendremos los filtros simples por ahora, la lógica de filtrado real iría aquí o en el backend
  const [filters, setFilters] = useState({});

  // Obtener rol del usuario
  const userRole = useStore((state) => state.user?.role);
  const canCreate = userRole === 'Admin' || userRole === 'RA';

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
  }, [/* filters */ toast]); // Añadir toast

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
    <div className="space-y-6">
        {/* Encabezado Consistente */}
        <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Contratos</h1>
            {/* Mostrar botón solo si tiene permiso */}
            {canCreate && (
                <Button onClick={() => navigate('/contracts/new')}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Crear Nuevo Contrato
                </Button>
            )}
        </div>

      {/* Filtros (si se implementan irían aquí, quizás en una Card separada) */}
      {/* <ContractFilters filters={filters} onFilterChange={setFilters} /> */}

      {/* Lista/Tabla de Contratos dentro de una Card */}
      {/* No añadimos padding a CardContent si la tabla ya tiene el suyo */}
      <Card>
          {/* Podríamos añadir un CardHeader si queremos un título dentro de la Card */}
          {/* <CardHeader><CardTitle>Lista de Contratos</CardTitle></CardHeader> */}
          <CardContent className="p-0"> { /* Sin padding para que la tabla ocupe todo */}
            {content} { /* Renderiza la lista/tabla o el estado de carga/error */} 
          </CardContent>
      </Card>

    </div>
  );
};

export default ContractManagement;