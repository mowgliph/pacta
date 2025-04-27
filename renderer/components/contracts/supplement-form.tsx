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
import { Checkbox } from '../ui/checkbox';
import { supplementSchema } from '../../lib/schemas';
import { createSupplement } from '../../lib/api';
import { cn } from '../../lib/utils';

// Tipo para props del componente
interface SupplementFormProps {
  contractId: string;
  contractData: any;
}

export function SupplementForm({ contractId, contractData }: SupplementFormProps) {
  const router = useRouter();
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  // Estado para seguimiento de campos modificados
  const [modifiedFields, setModifiedFields] = useState({
    endDate: false,
    value: false,
    type: false,
    description: false,
  });
  
  // Inicializar formulario con React Hook Form + Zod
  const form = useForm({
    resolver: zodResolver(supplementSchema),
    defaultValues: {
      contractId,
      title: '',
      description: '',
      effectiveDate: new Date().toISOString(),
      // Campos para modificaciones
      newEndDate: contractData.endDate || '',
      newValue: contractData.value
        ? String(JSON.parse(contractData.value).amount)
        : '',
      newCurrency: contractData.value
        ? JSON.parse(contractData.value).currency
        : 'MN',
      newType: contractData.type || 'Cliente',
      newDescription: contractData.description || '',
    },
  });
  
  // Mutación para crear suplemento
  const supplementMutation = useMutation({
    mutationFn: async (data: any) => {
      // Preparar cambios
      const changes: Record<string, any> = {};
      
      if (modifiedFields.endDate && data.newEndDate) {
        changes.endDate = {
          from: contractData.endDate || null,
          to: data.newEndDate,
        };
      }
      
      if (modifiedFields.value && data.newValue) {
        changes.value = {
          from: contractData.value || null,
          to: JSON.stringify({ amount: data.newValue, currency: data.newCurrency }),
        };
      }
      
      if (modifiedFields.type && data.newType !== contractData.type) {
        changes.type = {
          from: contractData.type,
          to: data.newType,
        };
      }
      
      if (modifiedFields.description && data.newDescription !== contractData.description) {
        changes.description = {
          from: contractData.description || '',
          to: data.newDescription,
        };
      }
      
      // Formatear datos para API
      const supplementData = {
        contractId: data.contractId,
        title: data.title,
        description: data.description,
        effectiveDate: data.effectiveDate,
        changes: JSON.stringify(changes),
      };
      
      // Crear suplemento
      const newSupplement = await createSupplement(supplementData);
      
      // Subir documento si existe
      if (documentFile) {
        const formData = new FormData();
        formData.append('file', documentFile);
        formData.append('supplementId', newSupplement.id);
        formData.append('contractId', contractId);
        formData.append('description', `Documento del suplemento: ${data.title}`);
        
        await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });
      }
      
      return newSupplement;
    },
    onSuccess: () => {
      toast.success('Suplemento creado correctamente');
      
      // Redirigir a la página del contrato
      router.push(`/contracts/${contractId}`);
      // Refrescar la página para mostrar cambios
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Error:', error);
      toast.error(
        error.response?.data?.message || 'Error al crear el suplemento'
      );
    },
  });
  
  // Manejar envío del formulario
  const onSubmit = (data: any) => {
    // Verificar que se haya modificado al menos un campo
    const hasChanges = Object.values(modifiedFields).some(Boolean);
    
    if (!hasChanges) {
      toast.error('Debe realizar al menos un cambio para crear un suplemento');
      return;
    }
    
    supplementMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Suplemento</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Extensión de plazo" {...field} />
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
              <FormLabel>Descripción del Suplemento</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detalle el propósito de este suplemento"
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
          name="effectiveDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha Efectiva</FormLabel>
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Modificaciones</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Seleccione los campos que desea modificar y proporcione los nuevos valores.
          </p>
          
          <div className="space-y-6">
            {/* Modificar Fecha de Fin */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="change-end-date"
                checked={modifiedFields.endDate}
                onCheckedChange={(checked) => 
                  setModifiedFields({...modifiedFields, endDate: Boolean(checked)})
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="change-end-date"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Modificar fecha de fin
                </label>
                {modifiedFields.endDate && (
                  <div className="pt-2">
                    <FormField
                      control={form.control}
                      name="newEndDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Nueva Fecha de Fin</FormLabel>
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
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Fecha actual: {contractData.endDate 
                        ? format(new Date(contractData.endDate), "dd/MM/yyyy") 
                        : "Sin fecha definida"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modificar Valor */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="change-value"
                checked={modifiedFields.value}
                onCheckedChange={(checked) => 
                  setModifiedFields({...modifiedFields, value: Boolean(checked)})
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="change-value"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Modificar valor
                </label>
                {modifiedFields.value && (
                  <div className="pt-2 grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="newValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nuevo Valor</FormLabel>
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
                      name="newCurrency"
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
                              <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-2 col-span-2">
                      Valor actual: {contractData.value 
                        ? `${JSON.parse(contractData.value).amount} ${JSON.parse(contractData.value).currency}`
                        : "No definido"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modificar Tipo */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="change-type"
                checked={modifiedFields.type}
                onCheckedChange={(checked) => 
                  setModifiedFields({...modifiedFields, type: Boolean(checked)})
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="change-type"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Modificar tipo de contrato
                </label>
                {modifiedFields.type && (
                  <div className="pt-2">
                    <FormField
                      control={form.control}
                      name="newType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nuevo Tipo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Tipo actual: {contractData.type}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modificar Descripción */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="change-description"
                checked={modifiedFields.description}
                onCheckedChange={(checked) => 
                  setModifiedFields({...modifiedFields, description: Boolean(checked)})
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="change-description"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Modificar descripción general
                </label>
                {modifiedFields.description && (
                  <div className="pt-2">
                    <FormField
                      control={form.control}
                      name="newDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descripción actualizada del contrato"
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Descripción actual: {contractData.description || "Sin descripción"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <FormLabel>Documento del Suplemento (opcional)</FormLabel>
          <FileUploadField
            accept=".pdf,.doc,.docx"
            maxSize={10}
            onFileSelected={(file) => setDocumentFile(file)}
            description="Seleccione el documento para este suplemento (PDF, DOC, DOCX, máx. 10MB)"
          />
        </div>
        
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
            disabled={supplementMutation.isPending}
          >
            {supplementMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Suplemento'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}