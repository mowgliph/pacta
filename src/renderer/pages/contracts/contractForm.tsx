import React, { useState, useEffect } from 'react';
import { useCreateContract, useUpdateContract } from '@/renderer/api/queryHooks';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';
import { Textarea } from '@/renderer/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/renderer/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/renderer/components/ui/card';
import { HoverGlow } from '@/renderer/components/ui/micro-interactions';
import { toast } from '@/renderer/hooks/use-toast';
import { Skeleton } from '@/renderer/components/ui/skeleton';
import { Contract } from '@/renderer/types/contracts';

// Definir el tipo correcto para el estado del contrato
type ContractStatus = 'Active' | 'Expired' | 'Pending' | 'Terminated';

interface ContractFormData {
  clientName: string;
  startDate: string;
  endDate: string;
  description: string;
  status: ContractStatus;
}

interface ContractFormProps {
  contract?: Contract;
  onSubmit: () => void;
  onCancel: () => void;
}

const ContractForm: React.FC<ContractFormProps> = ({
  contract,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ContractFormData>({
    clientName: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'Pending',
  });

  const { mutate: createContract, isLoading: isCreating } = useCreateContract();
  const { mutate: updateContract, isLoading: isUpdating } = useUpdateContract();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      status: value as ContractStatus 
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const contractData: Partial<Contract> = {
        name: formData.clientName,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        description: formData.description,
        status: formData.status,
      };

      if (contract?.id) {
        updateContract({
          id: contract.id,
          data: contractData,
        });
      } else {
        createContract(contractData);
      }
      onSubmit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el contrato';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (contract) {
      setFormData({
        clientName: contract.name ?? '',
        startDate: contract.startDate?.toISOString().split('T')[0] ?? '',
        endDate: contract.endDate?.toISOString().split('T')[0] ?? '',
        description: contract.description ?? '',
        status: contract.status,
      });
    }
  }, [contract]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{contract ? 'Editar Contrato' : 'Nuevo Contrato'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{contract ? 'Editar Contrato' : 'Nuevo Contrato'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nombre del Cliente</Label>
              <Input
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pendiente</SelectItem>
                <SelectItem value="Active">Activo</SelectItem>
                <SelectItem value="Terminated">Terminado</SelectItem>
                <SelectItem value="Expired">Expirado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <HoverGlow>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </HoverGlow>
            <HoverGlow>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Procesando...' : contract ? 'Actualizar' : 'Crear'}
              </Button>
            </HoverGlow>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContractForm;