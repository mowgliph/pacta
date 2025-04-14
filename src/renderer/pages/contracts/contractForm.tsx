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

interface UpdateContractVariables {
  id: string;
  data: FormData;
}

interface Contract {
  id: string;
  clientName: string;
  startDate: string;
  endDate: string;
  amount: number;
  description: string;
  status: string;
}

interface ContractFormData {
  clientName: string;
  startDate: string;
  endDate: string;
  amount: number;
  description: string;
  status: string;
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
    amount: 0,
    description: '',
    status: 'pending',
  });

  const { mutate: createContract, isLoading: isCreating } = useCreateContract();
  const { mutate: updateContract, isLoading: isUpdating } = useUpdateContract();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      if (contract) {
        updateContract({
          id: contract.id,
          data: formDataToSend
        });
        toast({ title: 'Éxito', description: 'Contrato actualizado exitosamente' });
      } else {
        createContract(formDataToSend);
        toast({ title: 'Éxito', description: 'Contrato creado exitosamente' });
      }
      onSubmit();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al procesar el contrato',
        variant: 'destructive',
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (contract) {
      setFormData({
        clientName: contract.clientName,
        startDate: contract.startDate,
        endDate: contract.endDate,
        amount: contract.amount,
        description: contract.description,
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
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
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