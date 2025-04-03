import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconPlus,
  IconFileText,
  IconDownload,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconClock,
} from '@tabler/icons-react';
import { type Supplement } from '../../services/contracts-service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Role } from '@/types/enums';

interface SupplementsListProps {
  contractId: string;
  supplements?: Supplement[];
  isLoading?: boolean;
  error?: string;
  onDelete?: (id: string) => void;
  isPublic?: boolean;
}

export const SupplementsList: React.FC<SupplementsListProps> = ({
  contractId,
  supplements = [],
  isLoading = false,
  error,
  onDelete,
  isPublic = false,
}) => {
  const navigate = useNavigate();
  const { usuario, tienePermiso } = useAuth();
  const puedeEditar = tienePermiso([Role.ADMIN, Role.MANAGER]);

  // Función para navegar a la creación de un nuevo suplemento
  const handleAddSupplement = () => {
    navigate(`/contracts/${contractId}/supplements/new`);
  };

  // Función para editar un suplemento
  const handleEditSupplement = (id: string) => {
    navigate(`/contracts/${contractId}/supplements/${id}/edit`);
  };

  // Función para ver detalles de un suplemento
  const handleViewSupplement = (id: string) => {
    navigate(`/contracts/${contractId}/supplements/${id}`);
  };

  // Función para descargar el documento
  const handleDownloadDocument = (documentUrl?: string) => {
    if (documentUrl) {
      // Crear una URL completa con el servidor backend
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const url = documentUrl.startsWith('http') ? documentUrl : `${baseUrl}/${documentUrl}`;
      window.open(url, '_blank');
    }
  };

  // Formato para las fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Suplementos</CardTitle>
          <CardDescription>Documentos adicionales que complementan el contrato</CardDescription>
        </div>
        {!isPublic && puedeEditar && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAddSupplement}
            className="gap-2"
          >
            <IconPlus className="h-4 w-4" />
            Añadir suplemento
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-destructive">
            <p>{error}</p>
          </div>
        ) : supplements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Este contrato no tiene suplementos</p>
            {puedeEditar && (
              <Button 
                variant="outline" 
                onClick={handleAddSupplement}
                className="mt-4"
              >
                Añadir el primer suplemento
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {supplements.map((supplement) => (
              <div 
                key={supplement.id} 
                className="flex justify-between items-center p-3 border rounded-md hover:bg-accent/5 transition-colors"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleViewSupplement(supplement.id)}
                >
                  <div className="bg-primary/10 p-2 rounded">
                    <IconFileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{supplement.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Fecha efectiva: {formatDate(supplement.effectiveDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {supplement.documentUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadDocument(supplement.documentUrl);
                      }}
                      title="Descargar documento"
                    >
                      <IconDownload size={16} />
                    </Button>
                  )}
                  {puedeEditar && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSupplement(supplement.id);
                        }}
                        title="Editar suplemento"
                      >
                        <IconEdit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(supplement.id);
                        }}
                        title="Eliminar suplemento"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 