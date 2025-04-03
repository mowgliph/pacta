import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { useContract, useSupplement } from '../hooks/useContracts';
import { IconArrowLeft, IconEdit, IconDownload, IconFileDownload } from '@tabler/icons-react';
import { ContractService } from '../services/contracts-service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type SupplementDetailsPageProps = {
  contractId: string;
  id: string;
  isPublic?: boolean;
};

/**
 * Página para mostrar los detalles de un suplemento
 */
export default function SupplementDetailsPage({
  contractId,
  id,
  isPublic = false
}: SupplementDetailsPageProps) {
  const navigate = useNavigate();
  
  // Obtener datos del contrato y suplemento
  const { data: contract, isLoading: isLoadingContract } = useContract(contractId);
  const { data: supplement, isLoading: isLoadingSupplement } = useSupplement(id);
  
  // Función para volver a la página de detalles del contrato
  const handleBack = () => {
    navigate(`/contracts/${contractId}`);
  };
  
  // Función para editar el suplemento
  const handleEdit = () => {
    navigate(`/contracts/${contractId}/supplements/${id}/edit`);
  };
  
  // Manejar descarga del documento del suplemento
  const handleDownloadDocument = () => {
    if (supplement?.documentUrl) {
      ContractService.downloadSupplementDocument(id);
    }
  };
  
  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: es });
  };
  
  // Si está cargando, mostrar esqueleto
  if (isLoadingContract || isLoadingSupplement) {
    return <div className="animate-pulse">Cargando...</div>;
  }
  
  // Si no hay datos, mostrar mensaje
  if (!supplement) {
    return <div>No se encontró el suplemento</div>;
  }
  
  // Obtener el nombre del creador
  const getCreatorName = () => {
    // Si hay un createdBy, mostrarlo (podría ser un ID o nombre)
    if (supplement.createdBy) {
      return supplement.createdBy;
    }
    return 'Sistema';
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title={supplement.name}
        description={`Suplemento del contrato: ${contract?.title || ''}`}
        backButton={true}
        backPath={`/contracts/${contractId}`}
        actions={
          !isPublic && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEdit}
                className="gap-2"
              >
                <IconEdit className="h-4 w-4" />
                Editar
              </Button>
              {supplement.documentUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={handleDownloadDocument}
                >
                  <IconDownload className="h-4 w-4" />
                  Descargar
                </Button>
              )}
            </div>
          )
        }
      />
      
      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle>Información del suplemento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nombre</h3>
              <p className="mt-1 text-sm">{supplement.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fecha efectiva</h3>
              <p className="mt-1 text-sm">{formatDate(supplement.effectiveDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Creado por</h3>
              <p className="mt-1 text-sm">{getCreatorName()}</p>
            </div>
          </div>
          
          {supplement.documentUrl && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadDocument} 
                className="flex items-center gap-2"
              >
                <IconFileDownload className="h-4 w-4" />
                Descargar documento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Descripción */}
      {supplement.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{supplement.description}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Nuevos acuerdos */}
      {supplement.newAgreements && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevos acuerdos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{supplement.newAgreements}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 