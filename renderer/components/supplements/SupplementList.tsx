"use client";

import { useState, useEffect } from "react";
import { Supplement, SupplementStatus } from "@/types/supplement.types";
import { useSupplements } from "@/hooks/useSupplements";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, Check, X } from "lucide-react";
import { ViewSupplementDialog } from "./ViewSupplementDialog";
import { PermissionGate } from "../auth/permission-gate";

interface SupplementListProps {
  contractId: string;
}

export function SupplementList({ contractId }: SupplementListProps) {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [selectedSupplement, setSelectedSupplement] =
    useState<Supplement | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const {
    getSupplementsByContract,
    approveSupplement,
    rejectSupplement,
    isLoading,
  } = useSupplements();

  const loadSupplements = async () => {
    const data = await getSupplementsByContract(contractId);
    setSupplements(data);
  };

  useEffect(() => {
    loadSupplements();
  }, [contractId]);

  const handleApprove = async (supplementId: string) => {
    await approveSupplement(supplementId);
    loadSupplements();
  };

  const handleReject = async (supplementId: string) => {
    await rejectSupplement(supplementId);
    loadSupplements();
  };

  const getStatusBadge = (status: SupplementStatus) => {
    const variants: Record<
      SupplementStatus,
      "destructive" | "default" | "secondary"
    > = {
      [SupplementStatus.PENDING]: "secondary",
      [SupplementStatus.APPROVED]: "default",
      [SupplementStatus.REJECTED]: "destructive",
    };

    const labels = {
      [SupplementStatus.PENDING]: "Pendiente",
      [SupplementStatus.APPROVED]: "Aprobado",
      [SupplementStatus.REJECTED]: "Rechazado",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Tipo de Cambio</th>
            <th>Fecha Efectiva</th>
            <th>Estado</th>
            <th>Creado Por</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {supplements.map((supplement) => (
            <tr key={supplement.id}>
              <td>{supplement.title}</td>
              <td>{supplement.changeType}</td>
              <td>
                {format(new Date(supplement.effectiveDate), "dd/MM/yyyy", {
                  locale: es,
                })}
              </td>
              <td>{getStatusBadge(supplement.status)}</td>
              <td>{supplement.createdBy.name}</td>
              <td className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedSupplement(supplement);
                    setIsViewDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {supplement.status === SupplementStatus.PENDING && (
                  <PermissionGate resource="contracts" action="approve">
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApprove(supplement.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(supplement.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  </PermissionGate>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {supplements.length === 0 && !isLoading && (
        <div className="text-center py-4 text-muted-foreground">
          No hay suplementos para este contrato
        </div>
      )}

      {selectedSupplement && (
        <ViewSupplementDialog
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedSupplement(null);
          }}
          supplement={selectedSupplement}
        />
      )}
    </div>
  );
}
