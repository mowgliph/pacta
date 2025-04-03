import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useContract, useSupplement, useUpdateSupplement } from '../hooks/useContracts';
import { useNotifications } from '@/hooks/useNotifications';
import { IconArrowLeft } from '@tabler/icons-react';

type SupplementEditPageProps = {
  contractId: string;
  id: string;
};

/**
 * Página para editar un suplemento existente
 */
export default function SupplementEditPage({ contractId, id }: SupplementEditPageProps) {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  
  // Cargar datos del contrato y suplemento
  const { data: contract } = useContract(contractId);
  const { data: supplement, isLoading, error, mutate: refreshSupplement } = useSupplement(id);
  
  // Estados del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [validity, setValidity] = useState('');
  const [newAgreements, setNewAgreements] = useState('');
  
  // Hook para actualizar suplemento
  const { execute: updateSupplement, isLoading: isSubmitting } = useUpdateSupplement(id, contractId);
  
  // Cargar datos iniciales cuando se obtenga el suplemento
  useEffect(() => {
    if (supplement) {
      setName(supplement.name);
      setDescription(supplement.description || '');
      setValidity(supplement.validity || '');
      setNewAgreements(supplement.newAgreements || '');
      
      // Formatear fecha para input type="date" (YYYY-MM-DD)
      const date = new Date(supplement.effectiveDate);
      const formattedDate = date.toISOString().split('T')[0];
      setEffectiveDate(formattedDate);
    }
  }, [supplement]);
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    if (!name || !effectiveDate) {
      showError('Error en el formulario', 'Por favor complete todos los campos obligatorios');
      return;
    }
    
    try {
      // Preparar los datos
      const formData = new FormData();
      
      // Crear objeto de datos y convertirlo a JSON
      const supplementData = JSON.stringify({
        name,
        description,
        effectiveDate,
        validity,
        newAgreements
      });
      
      // Añadir datos como campo "data"
      formData.append('data', supplementData);
      
      // Añadir el archivo si existe
      if (file) {
        formData.append('document', file);
      }
      
      // Actualizar suplemento
      await updateSupplement(formData);
      
      showSuccess('Suplemento actualizado', 'El suplemento se ha actualizado correctamente');
      navigate(`/contracts/${contractId}/supplements/${id}`);
    } catch (error) {
      console.error('Error al actualizar suplemento:', error);
      showError(
        'Error al actualizar suplemento', 
        'No se pudo actualizar el suplemento. Por favor, inténtelo de nuevo.'
      );
    }
  };
  
  // Función para volver a la página de detalles del suplemento
  const handleCancel = () => {
    navigate(`/contracts/${contractId}/supplements/${id}`);
  };
  
  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  // Si está cargando, mostrar un esqueleto
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cargando datos..."
          backButton={true}
          backPath={`/contracts/${contractId}/supplements/${id}`}
        />
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col space-y-4 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Si hay error o no se encuentra el suplemento
  if (!supplement) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Error al cargar suplemento"
          backButton={true}
          backPath={`/contracts/${contractId}`}
        />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">No se pudo cargar la información del suplemento</p>
            <Button onClick={() => navigate(`/contracts/${contractId}`)}>Volver al contrato</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar suplemento"
        description={`Para: ${contract?.name || ''}`}
        backButton={true}
        backPath={`/contracts/${contractId}/supplements/${id}`}
        actions={
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="gap-2"
          >
            <IconArrowLeft className="h-4 w-4" />
            Cancelar
          </Button>
        }
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Información del suplemento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del suplemento *</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Modificación de plazos"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Fecha de vigencia *</Label>
                <Input 
                  id="effectiveDate"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción detallada del suplemento..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">Documento (PDF)</Label>
              <Input 
                id="document"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
              {supplement.documentUrl && !file && (
                <p className="text-sm text-muted-foreground mt-1">
                  Ya hay un documento cargado. Seleccione uno nuevo solo si desea reemplazarlo.
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 