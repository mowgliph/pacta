import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { fetchContractDetails, addSupplement, editSupplement, openFile } from '@/renderer/api/electronAPI';
import { Button } from '@/renderer/components/ui/button';
import { useToast } from '@/renderer/hooks/use-toast';
import SupplementModal from './SupplementModal';
import { Loader2, Edit, FileText, PlusCircle } from 'lucide-react';
import useStore from '@/renderer/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/renderer/components/ui/card";

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (!(date instanceof Date) || isNaN(date)) return 'Fecha inválida';
    
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
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
  
  const userRole = useStore((state) => state.user?.role);
  const canEdit = userRole === 'Admin' || userRole === 'RA';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{contractData.name}</h1>
            <p className="text-sm text-muted-foreground">Detalles del Contrato</p>
        </div>
        {canEdit && (
            <Button
              variant="outline"
              onClick={() => navigate(`/contracts/${contractId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Contrato
            </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="space-y-1"><p className="text-muted-foreground text-xs">Nombre</p> <p className="font-medium">{contractData.name || '-'}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground text-xs">Tipo</p> <p>{contractData.type || '-'}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground text-xs">Estado</p> <p>{contractData.status || '-'}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground text-xs">Fecha Inicio</p> <p>{formatDate(contractData.startDate)}</p></div>
                  <div className="space-y-1"><p className="text-muted-foreground text-xs">Fecha Vencimiento</p> <p>{formatDate(contractData.endDate)}</p></div>
              </CardContent>
            </Card>

            {contractData.description && (
                 <Card>
                    <CardHeader><CardTitle>Descripción</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{contractData.description}</p>
                    </CardContent>
                </Card>
            )}
          </div>

          <div className="space-y-6">
              {contractData.documentPath && (
                 <Card>
                    <CardHeader><CardTitle>Documento Principal</CardTitle></CardHeader>
                    <CardContent className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                        <span className="flex-1 truncate text-sm text-foreground">{contractData.documentPath.split(/\\\\|\//).pop()}</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenFile(contractData.documentPath)}
                        >
                          Abrir
                        </Button>
                    </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>Suplementos</CardTitle>
                  {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSupplement(null);
                          setIsSupplementModalOpen(true);
                        }}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir
                      </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {contractData.supplements?.length > 0 ? (
                    <div className="space-y-3">
                      {contractData.supplements.map(supplement => (
                        <div
                          key={supplement.id}
                          className="border rounded-md p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background dark:bg-gray-700/30 shadow-sm"
                        >
                          <div className="mb-2 sm:mb-0 flex-1 mr-4">
                            <p className="text-sm font-medium text-foreground">{supplement.description || 'Sin descripción'}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(supplement.createdAt)}</p>
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
                            {canEdit && (
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
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No hay suplementos registrados.</p>
                  )}
                </CardContent>
              </Card>
          </div>
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