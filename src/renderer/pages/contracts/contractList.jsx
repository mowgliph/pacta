import React from 'react';
import { Link } from 'wouter';
import { Button } from "@/renderer/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/renderer/components/ui/table";
import { Trash2 } from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return 'Fecha inválida';
  }
};

const ContractList = ({ contracts = [], onDelete }) => {
  if (contracts.length === 0) {
    return <p className="text-center text-gray-500 py-4">No se encontraron contratos.</p>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Vencimiento</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">{contract.name || 'Sin Nombre'}</TableCell>
              <TableCell>{contract.type || 'N/A'}</TableCell>
              <TableCell>{contract.status || 'N/A'}</TableCell>
              <TableCell>{formatDate(contract.endDate)}</TableCell>
              <TableCell className="text-right space-x-2">
                <Link href={`/contracts/${contract.id}`}>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/contracts/${contract.id}`}>Ver Detalles</a>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de que quieres eliminar el contrato "${contract.name || 'este contrato'}"?`)) {
                      onDelete(contract.id);
                    }
                  }}
                  aria-label="Eliminar contrato"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
        ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractList;