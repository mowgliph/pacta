import React, { useState } from 'react';
import { useAddSupplement, useEditSupplement } from '@/renderer/api/queryHooks';
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { HoverGlow } from '@/renderer/components/ui/micro-interactions';
import { toast } from '@/renderer/hooks/use-toast';
import { Skeleton } from "@/renderer/components/ui/skeleton";

const SupplementModal = ({ contractId, supplement, onClose }) => {
  const [formData, setFormData] = useState({
    amount: supplement?.amount || '',
    description: supplement?.description || '',
    date: supplement?.date || new Date().toISOString().split('T')[0]
  });

  const { mutate: addSupplement, isLoading: isAdding } = useAddSupplement();
  const { mutate: editSupplement, isLoading: isEditing } = useEditSupplement();

  const isLoading = isAdding || isEditing;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (supplement) {
        await editSupplement({ 
          contractId, 
          supplementId: supplement.id, 
          data: formData 
        });
        toast({ title: 'Éxito', description: 'Suplemento actualizado exitosamente' });
      } else {
        await addSupplement({ 
          contractId, 
          data: formData 
        });
        toast({ title: 'Éxito', description: 'Suplemento agregado exitosamente' });
      }
      onClose();
    } catch (error) {
      console.error("Error submitting supplement:", error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Error al procesar el suplemento', 
        variant: 'destructive' 
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{supplement ? 'Editar Suplemento' : 'Nuevo Suplemento'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{supplement ? 'Editar Suplemento' : 'Nuevo Suplemento'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <HoverGlow>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </HoverGlow>
            <HoverGlow>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : (supplement ? 'Actualizar' : 'Agregar')}
              </Button>
            </HoverGlow>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupplementModal;