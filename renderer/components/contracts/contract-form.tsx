'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { FileUpload } from '../ui/file-upload';
import { contractSchema } from '../../lib/shemas';
import { createContract, updateContract } from '../../lib/api';
import { cn } from '../../lib/utils';

// Tipo para props del componente
interface ContractFormProps {
  contractData?: any; // Contrato existente para edición
  isEditing?: boolean;
}

export function ContractForm({ contractData, isEditing = false }: ContractFormProps) {
  const router = useRouter();
  const [mainDocument, setMainDocument] = useState<File | null>(null);
  
  // Inicializar formulario con React Hook Form + Zod
  const form = useForm({
    resolver: zodResolver(contractSchema),
    defaultValues: isEditing && contractData
      ? {
          contractNumber: contractData.contractNumber,
          title: contractData.title,
          description: contractData.description || '',
          parties: contractData.parties,
          startDate: contractData.startDate,
          endDate: contractData.endDate || '',
          value: contractData.value
            ? JSON.parse(contractData.value).amount + ''
            : '',
          currency: contractData.value
            ? JSON.parse(contractData.value).currency
            : 'MN',
          type: contractData.type,
          companyName: contractData.companyName,
          companyAddress: contractData.companyAddress || '',
          signDate: contractData.signDate,
          signPlace: contractData.signPlace || '',
          paymentMethod: contractData.paymentMethod || '',
          paymentTerm: contractData.paymentTerm || '',
        }
      : {
          contractNumber: '',
          title: '',
          description: '',
          parties: '',
          startDate: '',
          endDate: '',
          value: '',
          currency: 'MN',
          type: 'Cliente',
          companyName: '',
          companyAddress: '',
          signDate: '',
          signPlace: '',
          paymentMethod: '',
          paymentTerm: '',
        },
  });
  
  // Mutación para crear/actualizar contrato
  const contractMutation = useMutation({
    mutationFn: async (data: any) => {
      // Preparar datos del formulario
      const formattedData = {
        ...data,
        value: data.value
          ? JSON.stringify({ amount: data.value, currency: data.currency })
          : undefined,
      };
      
      // Eliminar campo currency que no está en el modelo
      delete formattedData.currency;
      
      // Crear o actualizar según modo
      if (isEditing) {
        return updateContract(contractData.id, formattedData);
      } else {
        return createContract(formattedData);
      }
    },
    onSuccess: async (data) => {
      // Subir documento principal si existe
      if (mainDocument) {
        try {
          const formData = new FormData();
          formData.append('file', mainDocument);
          formData.append('contractId', data.id);
          formData.append('isMain', 'true');
          formData.append('description', 'Documento principal');
          
          await fetch('/api/documents', {
            method: 'POST',
            body: formData,
          });
        } catch (error) {
          console.error('Error uploading document:', error);
          toast.error('El contrato se creó pero hubo un error al subir el documento');
        }
      }
      
      toast.success(
        isEditing
          ? 'Contrato actualizado correctamente'
          : 'Contrato creado correctamente'
      );
      
      // Redirigir a la página del contrato
      router.push(`/contracts/${data.id}`);
      // Refrescar la lista de contratos en caso de estar utilizando cache
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Error:', error);
      toast.error(
        error.response?.data?.message ||
          (isEditing
            ? 'Error al actualizar el contrato'
            : 'Error al crear el contrato')
      );
    },
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: any) => {
    contractMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="contractNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Contrato</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: CONT-2025-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isEditing}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Proveedor">Proveedor</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {isEditing && "El tipo no puede modificarse después de crear el contrato"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el título del contrato" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razón Social</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="companyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domicilio Legal</FormLabel>
                <FormControl>
                  <Input placeholder="Domicilio de la empresa (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="signDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Firma</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy")
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="signPlace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lugar de Firma</FormLabel>
                <FormControl>
                  <Input placeholder="Ciudad, País (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy")
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Fin (opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "dd/MM/yyyy")
                        ) : (
                          <span>Sin fecha de fin</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString())}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Dejar en blanco para contratos sin fecha de finalización definida
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Monto"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione moneda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MN">Moneda Nacional (MN)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de Pago (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Transferencia bancaria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="paymentTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plazo de Pago (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 30 días" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="parties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partes Involucradas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describa las partes involucradas en el contrato"
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descripción adicional del contrato"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!isEditing && (
          <div className="space-y-2">
            <FormLabel>Documento Principal (opcional)</FormLabel>
            <FileUpload
              accept=".pdf,.doc,.docx"
              maxSize={10}
              onFileSelected={(file) => setMainDocument(file)}
              description="Seleccione el documento principal del contrato (PDF, DOC, DOCX, máx. 10MB)"
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={contractMutation.isPending}
          >
            {contractMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              isEditing ? 'Actualizar Contrato' : 'Crear Contrato'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}