"use client";

import { useEffect, useState } from "react";
import { useSupplements } from "@/hooks/useSupplements";
import {
  Supplement,
  SupplementStatus,
  SupplementType,
} from "@/types/supplement.types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface SupplementListProps {
  contractId: string;
}

export const SupplementList = ({ contractId }: SupplementListProps) => {
  const {
    getSupplementsByContract,
    approveSupplement,
    rejectSupplement,
    isLoading,
    error,
  } = useSupplements();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSupplements();
  }, [contractId]);

  const loadSupplements = async () => {
    const supplements = await getSupplementsByContract(contractId);
    setSupplements(supplements);
  };

  const handleApprove = async (id: string) => {
    const updatedSupplement = await approveSupplement(id);
    if (updatedSupplement) {
      setSupplements(
        supplements.map((s) => (s.id === id ? updatedSupplement : s))
      );
      toast({
        title: "Éxito",
        description: "Suplemento aprobado correctamente",
      });
    }
  };

  const handleReject = async (id: string) => {
    const updatedSupplement = await rejectSupplement(id);
    if (updatedSupplement) {
      setSupplements(
        supplements.map((s) => (s.id === id ? updatedSupplement : s))
      );
      toast({
        title: "Éxito",
        description: "Suplemento rechazado correctamente",
      });
    }
  };

  const getStatusBadge = (status: SupplementStatus) => {
    switch (status) {
      case SupplementStatus.PENDING:
        return <Badge variant="secondary">Pendiente</Badge>;
      case SupplementStatus.APPROVED:
        return <Badge variant="default">Aprobado</Badge>;
      case SupplementStatus.REJECTED:
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: SupplementType) => {
    switch (type) {
      case SupplementType.AMOUNT:
        return "Monto";
      case SupplementType.DATE:
        return "Fecha";
      case SupplementType.DESCRIPTION:
        return "Descripción";
      case SupplementType.OTHER:
        return "Otro";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Tipo</TableHead>
              <TableHead>Valor Anterior</TableHead>
              <TableHead>Nuevo Valor</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead className="w-[150px]">Fecha</TableHead>
              <TableHead className="w-[150px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplements.map((supplement) => (
              <TableRow key={supplement.id}>
                <TableCell className="font-medium">
                  {getTypeLabel(supplement.type)}
                </TableCell>
                <TableCell>{supplement.previousValue}</TableCell>
                <TableCell>{supplement.newValue}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {supplement.description}
                </TableCell>
                <TableCell>{getStatusBadge(supplement.status)}</TableCell>
                <TableCell>
                  {format(new Date(supplement.createdAt), "PPP", {
                    locale: es,
                  })}
                </TableCell>
                <TableCell>
                  {supplement.status === SupplementStatus.PENDING && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(supplement.id)}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(supplement.id)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
