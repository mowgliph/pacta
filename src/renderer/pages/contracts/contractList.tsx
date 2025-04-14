import React from 'react';
import { useLocation } from 'wouter';
import { useContracts, useDeleteContract } from '@/renderer/api/queryHooks';
import { Button } from "@/renderer/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/renderer/components/ui/table";
import { Badge } from "@/renderer/components/ui/badge";
import { HoverGlow } from '@/renderer/components/ui/micro-interactions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/renderer/hooks/use-toast';
import { Skeleton } from "@/renderer/components/ui/skeleton";

interface Contract {
  id: string;
  clientName: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ContractListProps {
  filters?: Record<string, unknown>;
  onContractSelect: (id: string) => void;
}

const ContractList: React.FC<ContractListProps> = ({ filters, onContractSelect }) => {
  const [, navigate] = useLocation();
  const { data: contracts = [], isLoading, error } = useContracts(filters);
  const { mutate: deleteContract, isLoading: isDeleting } = useDeleteContract();

  const handleDelete = async (contractId: string): Promise<void> => {
    try {
      await deleteContract(contractId);
      toast({ title: 'Éxito', description: 'Contrato eliminado exitosamente' });
    } catch (error: any) {
      console.error("Error deleting contract:", error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Error al eliminar el contrato', 
        variant: 'destructive' 
      });
    }
  };

  const getStatusBadge = (status: string): JSX.Element => {
    const variants: Record<string, string> = {
      active: "bg-green-500",
      pending: "bg-yellow-500",
      expired: "bg-red-500",
      cancelled: "bg-gray-500"
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error al cargar los contratos</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lista de Contratos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.id}</TableCell>
                <TableCell>{contract.clientName}</TableCell>
                <TableCell>
                  {format(new Date(contract.startDate), 'PPP', { locale: es })}
                </TableCell>
                <TableCell>
                  {format(new Date(contract.endDate), 'PPP', { locale: es })}
                </TableCell>
                <TableCell>{getStatusBadge(contract.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <HoverGlow>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onContractSelect(contract.id)}
                        disabled={isDeleting}
                      >
                        Ver Detalles
                      </Button>
                    </HoverGlow>
                    <HoverGlow>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(contract.id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </HoverGlow>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ContractList;