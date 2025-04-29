"use client";

import { useState } from "react";
import { useSupplements } from "../../hooks/useSupplements";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ApproveSupplementDialog } from "./ApproveSupplementDialog";
import { useToast } from "../../hooks/use-toast";

interface SupplementListProps {
  contractId: string;
}

export function SupplementList({ contractId }: SupplementListProps) {
  const [selectedSupplementId, setSelectedSupplementId] = useState<
    string | null
  >(null);
  const { supplements, loading, error, deleteSupplement } =
    useSupplements(contractId);
  const { toast } = useToast();

  const handleDelete = async (supplementId: string) => {
    try {
      await deleteSupplement(supplementId);
      toast({
        title: "Suplemento eliminado",
        description: "El suplemento ha sido eliminado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting supplement:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el suplemento",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Cargando suplementos...</div>;
  if (error) return <div>Error al cargar los suplementos</div>;

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Efectiva</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supplements.map((supplement) => (
            <TableRow key={supplement.id}>
              <TableCell>{supplement.title}</TableCell>
              <TableCell>{supplement.description}</TableCell>
              <TableCell>
                <Badge
                  variant={supplement.isApproved ? "default" : "secondary"}
                >
                  {supplement.isApproved ? "Aprobado" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(supplement.effectiveDate), "PPP", {
                  locale: es,
                })}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {!supplement.isApproved && (
                    <ApproveSupplementDialog
                      supplementId={supplement.id}
                      trigger={<Button variant="outline">Aprobar</Button>}
                    />
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(supplement.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
