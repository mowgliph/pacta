import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';

// Tipos
export type SuplementoStatus = 'activo' | 'vencido';

export interface Suplemento {
  id: string;
  contratoId: string;
  nombre: string;
  descripcion: string;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  estado: SuplementoStatus;
  monto: number;
  moneda: string;
  documentoUrl?: string;
}

// Mapeo de estados a estilos
const statusMap: Record<SuplementoStatus, { text: string; className: string }> = {
  activo: { text: 'Activo', className: 'bg-green-100 text-green-800' },
  vencido: { text: 'Vencido', className: 'bg-red-100 text-red-800' },
};

// Formateador de fechas
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Fecha inválida';
  }
};

// Formateador de moneda
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const useSuplementoColumns = (): ColumnDef<Suplemento>[] => {
  const navigate = useNavigate();

  return useMemo(
    () => [
      {
        accessorKey: 'nombre',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-2"
            >
              Nombre
              {isSorted === 'asc' ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : isSorted === 'desc' ? (
                <ArrowDownIcon className="h-4 w-4" />
              ) : (
                <span className="h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('nombre')}</div>
        ),
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => (
          <div className="max-w-xs truncate">
            {row.getValue('descripcion')}
          </div>
        ),
      },
      {
        accessorKey: 'fechaSolicitud',
        header: 'Fecha Solicitud',
        cell: ({ row }) => formatDate(row.getValue('fechaSolicitud')),
      },
      {
        accessorKey: 'fechaAprobacion',
        header: 'Fecha Aprobación',
        cell: ({ row }) => {
          const fecha = row.getValue('fechaAprobacion');
          return fecha ? formatDate(fecha as string) : 'Pendiente';
        },
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.getValue('estado') as SuplementoStatus;
          const statusInfo = statusMap[status] || { 
            text: status, 
            className: 'bg-gray-100 text-gray-800' 
          };
          
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.text}
            </span>
          );
        },
      },
      {
        accessorKey: 'monto',
        header: 'Monto',
        cell: ({ row }) => {
          const monto = parseFloat(row.getValue('monto'));
          const moneda = row.original.moneda || 'USD';
          return formatCurrency(monto, moneda);
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const suplemento = row.original;
                navigate(`/contracts/${suplemento.contratoId}/suplementos/${suplemento.id}`);
              }}
            >
              Ver Detalles
            </Button>
          </div>
        ),
      },
    ],
    [navigate]
  );
};
