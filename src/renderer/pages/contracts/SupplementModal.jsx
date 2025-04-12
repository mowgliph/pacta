import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SupplementSchema } from '@/utils/validation/schemas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/renderer/components/ui/dialog';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Textarea } from '@/renderer/components/ui/textarea';
import { Calendar } from '@/renderer/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/renderer/components/ui/form';
import { toast } from 'sonner';
import { Loader2, FileText, Upload, Plus } from 'lucide-react';

const SupplementModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(SupplementSchema),
    defaultValues: initialData || {
      descripcion: '',
      fecha: new Date(),
      rutaArchivo: ''
    }
  });

  const handleFileSelect = async () => {
    try {
      setIsUploading(true);
      const result = await window.electron.ipcRenderer.invoke('dialog:selectFile', {
        filters: [
          { name: 'Documentos', extensions: ['pdf', 'doc', 'docx'] }
        ]
      });

      if (result) {
        setSelectedFile(result);
        form.setValue('rutaArchivo', result);
        toast.success('Archivo seleccionado correctamente');
      }
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      toast.error('Error al seleccionar el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsUploading(true);
      await onSubmit(data);
      toast.success(initialData ? 'Suplemento actualizado' : 'Suplemento creado');
      onClose();
    } catch (error) {
      console.error('Error al procesar suplemento:', error);
      toast.error(error.message || 'Error al procesar el suplemento');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supplement-modal-title"
        aria-describedby="supplement-modal-description"
      >
        <DialogHeader>
          <DialogTitle id="supplement-modal-title" className="flex items-center">
            <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
            {initialData ? 'Editar Suplemento' : 'Nuevo Suplemento'}
          </DialogTitle>
          <DialogDescription id="supplement-modal-description">
            {initialData ? 'Modifica los detalles del suplemento' : 'Agrega un nuevo suplemento al contrato'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" role="form" aria-label="Formulario de suplemento">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descripción del suplemento..."
                      className="resize-none"
                      aria-required="true"
                      aria-describedby="description-error"
                    />
                  </FormControl>
                  {form.formState.errors.descripcion && (
                    <p className="mt-2 text-sm text-red-600" id="description-error" role="alert">
                      {form.formState.errors.descripcion.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Calendar
                      selected={field.value}
                      onSelect={field.onChange}
                      className="rounded-md border"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rutaArchivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleFileSelect}
                        disabled={isUploading}
                        className="w-full"
                        aria-label={isUploading ? 'Cargando archivo' : selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : selectedFile ? (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            {selectedFile.split('/').pop()}
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Seleccionar archivo
                          </>
                        )}
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                aria-label="Cancelar y cerrar modal"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                aria-label={initialData ? 'Guardar cambios del suplemento' : 'Crear nuevo suplemento'}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : initialData ? (
                  'Actualizar'
                ) : (
                  'Crear'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplementModal;