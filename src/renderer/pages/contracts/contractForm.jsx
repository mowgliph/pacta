import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useLocation } from 'wouter';
import { toast } from '@/renderer/hooks/use-toast';
import {
  createContract,
  updateContract,
  fetchContractDetails,
  selectFile,
} from '@/renderer/api/electronAPI';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';
import { Textarea } from '@/renderer/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/renderer/components/ui/select';
import { Calendar } from '@/renderer/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/renderer/components/ui/popover';
import { CalendarIcon, UploadCloudIcon } from 'lucide-react';
import { cn } from '@/renderer/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContractSchema } from '@/utils/validation/schemas';
import { handleValidationError } from '@/renderer/utils/errorHandler';
import { Card, CardHeader, CardTitle, CardContent } from '@/renderer/components/ui/card';
import { FileText, File } from 'lucide-react';
import { HoverScale, HoverBounce, HoverElevation, HoverGlow } from '@/renderer/components/ui/hover-effects';

const formatDateForInput = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const ContractForm = () => {
  const params = useParams();
  const [, navigate] = useLocation();
  const contractId = params.id;
  const isEditing = !!contractId;

  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ContractSchema),
    defaultValues: {
      name: '',
      type: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      status: 'Active',
      fileUrl: ''
    },
  });

  useEffect(() => {
    if (isEditing) {
      const loadContract = async () => {
        setIsLoadingData(true);
        try {
          const contractData = await fetchContractDetails(contractId);
          if (contractData) {
            reset({
              name: contractData.name,
              type: contractData.type,
              description: contractData.description,
              startDate: formatDateForInput(contractData.startDate),
              endDate: formatDateForInput(contractData.endDate),
              status: contractData.status,
            });
          } else {
            toast({ title: 'Error', description: 'No se encontró el contrato.', variant: 'destructive' });
            navigate('/contracts');
          }
        } catch (error) {
          console.error("Error fetching contract details:", error);
          toast({ title: 'Error', description: 'No se pudieron cargar los datos del contrato.', variant: 'destructive' });
          navigate('/contracts');
        } finally {
          setIsLoadingData(false);
        }
      };
      loadContract();
    } else {
      reset();
      setSelectedFileName('');
      setSelectedFilePath('');
    }
  }, [isEditing, contractId, reset, navigate]);

  const handleFileSelect = async () => {
    const filePath = await selectFile();
    if (filePath) {
      setSelectedFilePath(filePath);
      const fileName = filePath.split(/\\|\//).pop();
      setSelectedFileName(fileName || 'Archivo seleccionado');
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        ...(selectedFilePath && { documentPath: selectedFilePath }),
      };

      const result = isEditing 
        ? await updateContract(contractId, payload)
        : await createContract(payload);

      if (result) {
        toast({
          title: 'Éxito',
          description: `Contrato ${isEditing ? 'actualizado' : 'creado'} correctamente.`,
        });
        navigate('/contracts');
      }
    } catch (error) {
      const validationErrors = handleValidationError(error);
      validationErrors.forEach(err => {
        toast({ 
          title: 'Error de Validación', 
          description: `${err.campo}: ${err.mensaje}`,
          variant: 'destructive' 
        });
      });
    }
  };

  if (isLoadingData) {
    return <div className="p-8 text-center">Cargando datos del contrato...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8" role="main" aria-label="Formulario de contrato">
      <div className="flex justify-between items-center">
        <HoverScale>
          <h1 className="text-2xl font-bold" aria-level="1">
            {isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}
          </h1>
        </HoverScale>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" role="form" aria-label="Formulario de contrato">
        <div className="grid gap-6 md:grid-cols-2" role="region" aria-label="Información básica">
          <HoverElevation>
            <Card role="article" aria-label="Datos del contrato">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
                  Datos del Contrato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    Nombre del Contrato
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      type="text"
                      {...control('name')}
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-required="true"
                      aria-describedby="name-error"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600" id="name-error" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-foreground">
                    Cliente
                  </label>
                  <div className="mt-1">
                    <input
                      id="client"
                      type="text"
                      {...control('client')}
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-required="true"
                      aria-describedby="client-error"
                    />
                  </div>
                  {errors.client && (
                    <p className="mt-2 text-sm text-red-600" id="client-error" role="alert">
                      {errors.client.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground">
                    Descripción
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      {...control('description')}
                      rows={4}
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-describedby="description-error"
                    />
                  </div>
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600" id="description-error" role="alert">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </HoverElevation>

          <HoverElevation>
            <Card role="article" aria-label="Fechas y montos">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" aria-hidden="true" />
                  Fechas y Montos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-foreground">
                    Fecha de Inicio
                  </label>
                  <div className="mt-1">
                    <input
                      id="startDate"
                      type="date"
                      {...control('startDate')}
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-required="true"
                      aria-describedby="start-date-error"
                    />
                  </div>
                  {errors.startDate && (
                    <p className="mt-2 text-sm text-red-600" id="start-date-error" role="alert">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-foreground">
                    Fecha de Fin
                  </label>
                  <div className="mt-1">
                    <input
                      id="endDate"
                      type="date"
                      {...control('endDate')}
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-required="true"
                      aria-describedby="end-date-error"
                    />
                  </div>
                  {errors.endDate && (
                    <p className="mt-2 text-sm text-red-600" id="end-date-error" role="alert">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-foreground">
                    Monto Total
                  </label>
                  <div className="mt-1">
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      {...control('amount')}
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-required="true"
                      aria-describedby="amount-error"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-2 text-sm text-red-600" id="amount-error" role="alert">
                      {errors.amount.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </HoverElevation>
        </div>

        <HoverGlow>
          <Card role="article" aria-label="Documentos adjuntos">
            <CardHeader>
              <CardTitle className="flex items-center">
                <File className="h-5 w-5 mr-2" aria-hidden="true" />
                Documentos Adjuntos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="document" className="block text-sm font-medium text-foreground">
                    Documento Principal
                  </label>
                  <div className="mt-1">
                    <input
                      id="document"
                      type="file"
                      onChange={handleFileSelect}
                      className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-describedby="document-error"
                    />
                  </div>
                  {errors.fileUrl && (
                    <p className="mt-2 text-sm text-red-600" id="document-error" role="alert">
                      {errors.fileUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </HoverGlow>

        <div className="flex justify-end">
          <HoverBounce>
            <Button 
              type="submit"
              className="flex items-center"
              aria-label={isEditing ? 'Guardar cambios del contrato' : 'Crear nuevo contrato'}
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Contrato'}
            </Button>
          </HoverBounce>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;