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
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Editar Contrato' : 'Crear Nuevo Contrato'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="space-y-4">
          {/* Name field */}
          <div>
            <Label htmlFor="name">Nombre del Contrato</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  disabled={isSubmitting}
                  className={cn("mt-1", errors.name && "border-red-500")}
                />
              )}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          {/* Type field */}
          <div>
            <Label htmlFor="type">Tipo de Contrato</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="type"
                  disabled={isSubmitting}
                  placeholder="Ej. Acuerdo de Servicio, NDA"
                  className={cn("mt-1", errors.type && "border-red-500")}
                />
              )}
            />
            {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
          </div>

          {/* Description field */}
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="description"
                  rows={4}
                  disabled={isSubmitting}
                  className={cn("mt-1", errors.description && "border-red-500")}
                />
              )}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <Label>Fecha de Inicio</Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    className={cn("rounded-md border", errors.startDate && "border-red-500")}
                  />
                )}
              />
              {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>}
            </div>

            {/* End Date */}
            <div>
              <Label>Fecha de Fin</Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < field.value}
                    className={cn("rounded-md border", errors.endDate && "border-red-500")}
                  />
                )}
              />
              {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>Estado</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={cn(errors.status && "border-red-500")}>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Activo</SelectItem>
                    <SelectItem value="Inactive">Inactivo</SelectItem>
                    <SelectItem value="Pending">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>}
          </div>

          {/* File Upload */}
          <div>
            <Label>Documento Adjunto</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleFileSelect}
                className={cn(errors.fileUrl && "border-red-500")}
              >
                <UploadCloudIcon className="mr-2 h-4 w-4" />
                {selectedFileName || 'Seleccionar archivo'}
              </Button>
            </div>
            {errors.fileUrl && <p className="text-sm text-red-600 mt-1">{errors.fileUrl.message}</p>}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Contrato' : 'Crear Contrato')}
        </Button>
      </form>
    </div>
  );
};

export default ContractForm;