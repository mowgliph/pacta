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
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      type: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'Active',
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
      let result = null;
      const payload = {
        ...data,
        ...(selectedFilePath && { documentPath: selectedFilePath }),
      };

      if (isEditing) {
        result = await updateContract(contractId, payload);
      } else {
        result = await createContract(payload);
      }

      if (result) {
        toast({
          title: 'Éxito',
          description: `Contrato ${isEditing ? 'actualizado' : 'creado'} correctamente.`,
        });
        navigate('/contracts');
      } else {
        toast({ title: 'Error', description: `No se pudo ${isEditing ? 'actualizar' : 'crear'} el contrato.`, variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error submitting contract:", error);
      toast({ title: 'Error', description: `Ocurrió un error: ${error.message || 'Error desconocido'}`, variant: 'destructive' });
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
        <div>
          <Label htmlFor="name">Nombre del Contrato</Label>
          <Input
            id="name"
            {...register('name', { required: 'El nombre es requerido' })}
            disabled={isSubmitting}
            className="mt-1"
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="type">Tipo de Contrato</Label>
          <Input
            id="type"
            {...register('type')}
            disabled={isSubmitting}
            placeholder="Ej. Acuerdo de Servicio, NDA"
            className="mt-1"
          />
          {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={4}
            disabled={isSubmitting}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input
              id="startDate"
              type="date"
              {...register('startDate')}
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>}
          </div>
          <div>
            <Label htmlFor="endDate">Fecha de Vencimiento</Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.endDate && <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="status">Estado</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Activo</SelectItem>
                  <SelectItem value="Pending">Pendiente</SelectItem>
                  <SelectItem value="Expired">Vencido</SelectItem>
                  <SelectItem value="Terminated">Terminado</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <Label>Documento Principal</Label>
          <div className="mt-1 flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleFileSelect}
              disabled={isSubmitting}
            >
              <UploadCloudIcon className="mr-2 h-4 w-4" />
              Seleccionar Archivo
            </Button>
            {selectedFileName && (
                <span className="text-sm text-gray-600 truncate" title={selectedFileName}>
                    {selectedFileName}
                 </span>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
           <Button type="button" variant="ghost" onClick={() => navigate('/contracts')} disabled={isSubmitting}>
             Cancelar
           </Button>
           <Button type="submit" disabled={isSubmitting}>
             {isSubmitting ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Contrato')}
           </Button>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;