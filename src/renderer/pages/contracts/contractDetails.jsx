import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { fetchContractDetails, addSupplement, editSupplement, openFile } from '@/renderer/api/electronAPI';
import { Button } from '@/renderer/components/ui/button';
import { useToast } from '@/renderer/hooks/use-toast';
import SupplementModal from './SupplementModal';
import { Loader2, Edit, FileText, PlusCircle } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return 'Fecha inválida';
  }
};

const ContractDetails = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const contractId = params.id;

  const [contractData, setContractData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!contractId) {
        setError('ID de contrato no válido.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchContractDetails(contractId);
        if (data) {
          setContractData(data);
        } else {
          setError('No se encontró el contrato.');
          toast({ title: 'Error', description: 'No se encontró el contrato.', variant: 'destructive' });
        }
      } catch (err) {
        console.error("Error loading contract details:", err);
        setError('No se pudieron cargar los detalles del contrato.');
        toast({ title: 'Error', description: 'No se pudieron cargar los detalles.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [contractId, toast]);

  const handleSupplementSubmit = async (supplementData) => {
    setIsLoading(true);
    try {
      let result;
      if (selectedSupplement) {
        result = await editSupplement(contractId, selectedSupplement.id, supplementData);
      } else {
        result = await addSupplement(contractId, supplementData);
      }

      if (result) {
        toast({
          title: selectedSupplement ? 'Suplemento actualizado' : 'Suplemento añadido',
          description: 'La operación se completó exitosamente'
        });
        const updatedData = await fetchContractDetails(contractId);
        if (updatedData) setContractData(updatedData);
        setIsSupplementModalOpen(false);
        setSelectedSupplement(null);
      } else {
         throw new Error('La operación del suplemento falló.');
      }
    } catch (error) {
      console.error("Error procesando suplemento:", error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo procesar el suplemento',
        variant: 'destructive'
      });
    } finally {
       setIsLoading(false);
    }
  };

  const handleOpenFile = async (filePath) => {
    try {
      await openFile(filePath);
    } catch (error) {
      console.error("Error al abrir archivo desde detalles:", error);
      toast({ title: 'Error', description: `No se pudo abrir el archivo: ${error.message || 'Error desconocido'}`, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /> Cargando detalles...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!contractData) {
    // Si no hay error pero tampoco datos (puede pasar si la API devuelve null)
    return <div className="p-8 text-center text-gray-500">No hay datos del contrato disponibles.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold truncate">Detalles: {contractData.name}</h1>
        <Button
          variant="outline"
          onClick={() => navigate(`/contracts/${contractId}/edit`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-md shadow-sm">
            <div><strong className="text-gray-600 block mb-1">Nombre:</strong> {contractData.name || '-'}</div>
            <div><strong className="text-gray-600 block mb-1">Tipo:</strong> {contractData.type || '-'}</div>
            <div><strong className="text-gray-600 block mb-1">Estado:</strong> {contractData.status || '-'}</div>
            <div><strong className="text-gray-600 block mb-1">Fecha Inicio:</strong> {formatDate(contractData.startDate)}</div>
            <div><strong className="text-gray-600 block mb-1">Fecha Vencimiento:</strong> {formatDate(contractData.endDate)}</div>
          </div>
        </section>

        {contractData.description && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Descripción</h2>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-wrap shadow-sm">{contractData.description}</p>
          </section>
        )}

        {contractData.documentPath && (
          <section>
            <h2 className="text-xl font-semibold mb-3">Documento Principal</h2>
            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-md shadow-sm">
              <FileText className="h-5 w-5 text-gray-600 flex-shrink-0"/>
              <span className="flex-1 truncate text-gray-700">{contractData.documentPath.split(/\\\\|\//).pop()}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenFile(contractData.documentPath)}
              >
                Abrir
              </Button>
            </div>
          </section>
        )}

        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Suplementos</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSupplement(null);
                setIsSupplementModalOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Suplemento
            </Button>
          </div>
          {contractData.supplements?.length > 0 ? (
            <div className="space-y-3 bg-gray-50 p-4 rounded-md shadow-sm">
              {contractData.supplements.map(supplement => (
                <div
                  key={supplement.id}
                  className="border rounded-md p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-sm"
                >
                  <div className="mb-2 sm:mb-0 flex-1 mr-4">
                    <p className="font-medium text-gray-800">{supplement.description || 'Sin descripción'}</p>
                    <p className="text-xs text-gray-500">{formatDate(supplement.date)}</p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    {supplement.filePath && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenFile(supplement.filePath)}
                      >
                        <FileText className="mr-1 h-4 w-4" /> Ver Doc.
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSupplement(supplement);
                        setIsSupplementModalOpen(true);
                      }}
                    >
                      <Edit className="mr-1 h-4 w-4" /> Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-md shadow-sm">No hay suplementos registrados.</p>
          )}
        </section>
      </div>

      <SupplementModal
        isOpen={isSupplementModalOpen}
        onClose={() => {
          setIsSupplementModalOpen(false);
          setSelectedSupplement(null);
        }}
        onSubmit={handleSupplementSubmit}
        initialData={selectedSupplement}
      />
    </div>
  );
};

export default ContractDetails;