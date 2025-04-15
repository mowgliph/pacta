import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { contractService, supplementService } from '@/renderer/services';
import { Button } from '@/renderer/components/ui/button';
import { useToast } from '@/renderer/hooks/use-toast';
import SupplementModal from './SupplementModal';
import { Loader2, Edit, FileText, PlusCircle, Plus } from 'lucide-react';
import useStore from '@/renderer/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/renderer/components/ui/card";
import { SkeletonCard, SkeletonList, Skeleton } from '@/renderer/components/ui/skeleton';
import { HoverElevation, HoverScale, HoverGlow, HoverBounce, HoverBackground } from '@/renderer/components/ui/micro-interactions';
import { Calendar } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  filePath: string;
}

interface Supplement {
  id: string;
  title?: string;
  description: string;
  amount: number;
  filePath: string;
  date: string;
}

interface ContractData {
  id: string;
  name: string;
  client: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  documents?: Document[];
  supplements?: Supplement[];
}

interface ServerContract {
  id: number;
  name: string;
  companyName?: string;
  client?: string;
  status: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  documents?: Array<{
    id: number;
    name: string;
    filePath?: string;
    fileUrl?: string;
  }>;
  supplements?: Array<{
    id: number;
    title?: string;
    description: string;
    amount: number;
    date: Date;
    filePath?: string;
    fileUrl?: string;
  }>;
}

interface SupplementFormData {
  title: string;
  amount: string | number;
  description: string;
  date: string;
}

interface SupplementData {
  title: string;
  amount: number;
  description: string;
  date: Date;
}

interface SupplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (supplementData: SupplementFormData) => Promise<void>;
  initialData?: Supplement | null;
}

const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (!(date instanceof Date) || isNaN(date.getTime())) return 'Fecha inválida';
    
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Fecha inválida';
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'CUP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const ContractDetails: React.FC = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const contractId = params.id;

  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState<boolean>(false);
  const [selectedSupplement, setSelectedSupplement] = useState<Supplement | null>(null);

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
        const data = await contractService.getContractDetails(contractId) as unknown as ServerContract;
        if (data) {
          const mappedData: ContractData = {
            id: data.id.toString(),
            name: data.name || '',
            client: data.client || data.companyName || '',
            status: data.status || 'Active',
            startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
            amount: typeof data.amount === 'number' ? data.amount : 0,
            documents: Array.isArray(data.documents) ? data.documents.map((doc) => ({
              id: doc.id.toString(),
              name: doc.name || 'Documento sin nombre',
              filePath: doc.filePath || doc.fileUrl || ''
            })) : [],
            supplements: Array.isArray(data.supplements) ? data.supplements.map((sup) => ({
              id: sup.id.toString(),
              title: sup.title || '',
              description: sup.description || '',
              amount: typeof sup.amount === 'number' ? sup.amount : 0,
              filePath: sup.filePath || sup.fileUrl || '',
              date: sup.date ? new Date(sup.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            })) : []
          };
          setContractData(mappedData);
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

  const handleSupplementSubmit = async (supplementData: SupplementFormData): Promise<void> => {
    if (!contractId) {
      toast({
        title: 'Error',
        description: 'ID de contrato no válido',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedData: SupplementData = {
        ...supplementData,
        amount: typeof supplementData.amount === 'string' 
          ? parseFloat(supplementData.amount) 
          : supplementData.amount,
        date: new Date(supplementData.date)
      };

      let result;
      if (selectedSupplement) {
        result = await supplementService.updateSupplement(
          contractId,
          selectedSupplement.id,
          formattedData
        );
      } else {
        result = await supplementService.addSupplement(
          contractId,
          formattedData
        );
      }
  
      if (result) {
        toast({
          title: selectedSupplement ? 'Suplemento actualizado' : 'Suplemento añadido',
          description: 'La operación se completó exitosamente'
        });

        const updatedData = await contractService.getContractDetails(contractId) as unknown as ServerContract;
        if (updatedData) {
          const mappedData: ContractData = {
            id: updatedData.id.toString(),
            name: updatedData.name || '',
            client: updatedData.client || updatedData.companyName || '',
            status: updatedData.status || 'Active',
            startDate: updatedData.startDate ? new Date(updatedData.startDate).toISOString().split('T')[0] : '',
            endDate: updatedData.endDate ? new Date(updatedData.endDate).toISOString().split('T')[0] : '',
            amount: typeof updatedData.amount === 'number' ? updatedData.amount : 0,
            documents: Array.isArray(updatedData.documents) ? updatedData.documents.map(doc => ({
              id: doc.id.toString(),
              name: doc.name || 'Documento sin nombre',
              filePath: doc.filePath || doc.fileUrl || ''
            })) : [],
            supplements: Array.isArray(updatedData.supplements) ? updatedData.supplements.map(sup => ({
              id: sup.id.toString(),
              title: sup.title || '',
              description: sup.description || '',
              amount: typeof sup.amount === 'number' ? sup.amount : 0,
              filePath: sup.filePath || sup.fileUrl || '',
              date: sup.date ? new Date(sup.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            })) : []
          };
          setContractData(mappedData);
        }
        setIsSupplementModalOpen(false);
        setSelectedSupplement(null);
      } else {
        throw new Error('La operación del suplemento falló.');
      }
    } catch (error: unknown) {
      console.error("Error procesando suplemento:", error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo procesar el suplemento';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFile = async (filePath: string): Promise<void> => {
    try {
      await window.electronAPI.invoke('files:open', filePath);
    } catch (error: unknown) {
      console.error("Error al abrir archivo desde detalles:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({ 
        title: 'Error', 
        description: `No se pudo abrir el archivo: ${errorMessage}`, 
        variant: 'destructive' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <HoverElevation>
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonCard />
                </CardContent>
              </Card>
            </HoverElevation>

            <HoverGlow>
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Contrato</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonList count={4} />
                </CardContent>
              </Card>
            </HoverGlow>
          </div>

          <div className="space-y-6">
            <HoverBounce>
              <Card>
                <CardHeader>
                  <CardTitle>Archivos Adjuntos</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonList count={3} />
                </CardContent>
              </Card>
            </HoverBounce>

            <HoverBounce>
              <Card>
                <CardHeader>
                  <CardTitle>Suplementos</CardTitle>
                </CardHeader>
                <CardContent>
                  <SkeletonList count={3} />
                </CardContent>
              </Card>
            </HoverBounce>
          </div>
        </div>
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
            <p className="text-destructive">Ha ocurrido un error al cargar los detalles del contrato</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contractData) {
    return <div className="p-8 text-center text-gray-500">No se encontraron datos del contrato.</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8" role="main" aria-label="Detalles del contrato">
      <div className="flex justify-between items-center">
        <HoverScale>
          <h1 className="text-2xl font-bold" aria-level={1}>Detalles del Contrato</h1>
        </HoverScale>
        <div className="flex space-x-4">
          <HoverBounce>
            <Button 
              onClick={() => setIsSupplementModalOpen(true)}
              className="flex items-center"
              aria-label="Agregar suplemento al contrato"
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Agregar Suplemento
            </Button>
          </HoverBounce>
          <HoverBounce>
            <Button 
              variant="outline" 
              onClick={() => navigate('/contracts')}
              aria-label="Volver a la lista de contratos"
            >
              Volver
            </Button>
          </HoverBounce>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2" role="region" aria-label="Información del contrato">
        <HoverElevation>
          <Card role="article" aria-label="Información general">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Nombre del Contrato
                </label>
                <p className="mt-1 text-sm text-muted-foreground" aria-label={`Nombre del contrato: ${contractData.name}`}>
                  {contractData.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Cliente
                </label>
                <p className="mt-1 text-sm text-muted-foreground" aria-label={`Cliente: ${contractData.client}`}>
                  {contractData.client}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Estado
                </label>
                <p className="mt-1 text-sm text-muted-foreground" aria-label={`Estado del contrato: ${contractData.status}`}>
                  {contractData.status}
                </p>
              </div>
            </CardContent>
          </Card>
        </HoverElevation>

        <HoverElevation>
          <Card role="article" aria-label="Detalles del contrato">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" aria-hidden="true" />
                Fechas y Montos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Fecha de Inicio
                </label>
                <p className="mt-1 text-sm text-muted-foreground" aria-label={`Fecha de inicio: ${formatDate(contractData.startDate)}`}>
                  {formatDate(contractData.startDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Fecha de Fin
                </label>
                <p className="mt-1 text-sm text-muted-foreground" aria-label={`Fecha de fin: ${formatDate(contractData.endDate)}`}>
                  {formatDate(contractData.endDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Monto Total
                </label>
                <p className="mt-1 text-sm text-muted-foreground" aria-label={`Monto total: ${formatCurrency(contractData.amount)}`}>
                  {formatCurrency(contractData.amount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </HoverElevation>
      </div>

      <div className="grid gap-6 md:grid-cols-2" role="region" aria-label="Documentos y suplementos">
        <HoverGlow>
          <Card role="article" aria-label="Documentos adjuntos">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
                Documentos Adjuntos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractData.documents?.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                      <span className="text-sm" aria-label={`Documento: ${doc.name}`}>
                        {doc.name}
                      </span>
                    </div>
                    <HoverBackground>
                      <button
                        onClick={() => handleOpenFile(doc.filePath)}
                        className="text-primary hover:text-primary/80"
                        aria-label={`Descargar documento ${doc.name}`}
                      >
                        Descargar
                      </button>
                    </HoverBackground>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </HoverGlow>

        <HoverGlow>
          <Card role="article" aria-label="Suplementos">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                Suplementos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractData.supplements?.map((supplement) => (
                  <div key={supplement.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" aria-label={`Suplemento: ${supplement.description}`}>
                        {supplement.description}
                      </p>
                      <p className="text-xs text-muted-foreground" aria-label={`Monto: ${formatCurrency(supplement.amount)}`}>
                        {formatCurrency(supplement.amount)}
                      </p>
                    </div>
                    <HoverBackground>
                      <button
                        onClick={() => handleOpenFile(supplement.filePath)}
                        className="text-primary hover:text-primary/80"
                        aria-label={`Ver detalles del suplemento ${supplement.description}`}
                      >
                        Ver Detalles
                      </button>
                    </HoverBackground>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </HoverGlow>
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