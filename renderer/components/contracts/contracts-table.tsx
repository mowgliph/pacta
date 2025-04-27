'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { 
  ChevronDown, 
  ChevronUp, 
  File, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Archive 
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { formatDate } from '../../lib/utils'
import { useRequireAuth } from "../../hooks/useRequireAuth";

// Definir tipos
type Contract = {
  id: string
  contractNumber: string
  title: string
  companyName: string
  type: string
  status: string
  startDate: string
  endDate?: string
  _count: { supplements: number }
}

interface ContractsTableProps {
  data: Contract[]
  totalCount: number
  pageCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (page: number) => void
}

// Definir columnas
const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: 'contractNumber',
    header: 'No. Contrato',
    cell: ({ row }) => (
      <div className="font-medium">
        <Link 
          href={`/contracts/${row.original.id}`} 
          className="hover:underline text-primary"
        >
          {row.getValue('contractNumber')}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: 'companyName',
    header: 'Empresa',
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant={type === 'Cliente' ? 'default' : 'outline'}>
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline'
      
      switch (status) {
        case 'active':
          variant = 'default'
          break
        case 'expiring_soon':
          variant = 'secondary'
          break
        case 'expired':
          variant = 'destructive'
          break
      }
      
      const label = {
        'active': 'Vigente',
        'expiring_soon': 'Próximo a vencer',
        'expired': 'Vencido',
        'archived': 'Archivado',
      }[status] || status
      
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    accessorKey: 'endDate',
    header: 'Fecha Venc.',
    cell: ({ row }) => {
      const date = row.getValue('endDate') as string | undefined
      return date ? formatDate(date) : 'Sin fecha'
    },
  },
  {
    id: 'supplements',
    header: 'Supl.',
    cell: ({ row }) => row.original._count.supplements,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const contract = row.original
      const { requireAuth, AuthModal } = useRequireAuth();
      const router = useRouter();
      
      const handleAddSupplement = (contractId: string) => {
        requireAuth(() => {
          router.push(`/contracts/${contractId}/supplement/new`);
        });
      };
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/contracts/${contract.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Ver detalles</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddSupplement(contract.id)}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Agregar suplemento</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/contracts/${contract.id}/archive`}>
                <Archive className="mr-2 h-4 w-4" />
                <span>Archivar</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Componente principal
export function ContractsTable({
  data,
  totalCount,
  pageCount,
  pageIndex,
  pageSize,
  onPageChange,
}: ContractsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const router = useRouter()
  const { requireAuth, AuthModal } = useRequireAuth();
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  })
  
  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="ml-1 h-4 w-4" />,
                          desc: <ChevronDown className="ml-1 h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  className="cursor-pointer"
                  onClick={() => router.push(`/contracts/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between p-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {pageIndex * pageSize + 1} a{' '}
          {Math.min((pageIndex + 1) * pageSize, totalCount)} de {totalCount} registros
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex === 0}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex === pageCount - 1}
          >
            Siguiente
          </Button>
        </div>
      </div>
      <AuthModal />
    </Card>
  )
}