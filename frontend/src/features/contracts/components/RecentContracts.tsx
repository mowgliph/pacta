import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RecentContractsProps = {
  className?: string;
}

// Datos de ejemplo
const recentContracts = [
  {
    id: '1',
    title: 'Contrato de Servicios ACME',
    client: 'ACME Corp',
    value: '$24,500',
    status: 'Activo',
    clientAvatar: '/avatars/a1.png',
    clientInitials: 'AC',
  },
  {
    id: '2',
    title: 'Licencia de Software ABC',
    client: 'Industrias ABC',
    value: '$8,350',
    status: 'Pendiente',
    clientAvatar: '/avatars/a2.png',
    clientInitials: 'IA',
  },
  {
    id: '3',
    title: 'Contrato de Consultoría XYZ',
    client: 'Consultoría XYZ',
    value: '$12,800',
    status: 'Completado',
    clientAvatar: '/avatars/a3.png',
    clientInitials: 'CX',
  },
  {
    id: '4',
    title: 'Acuerdo de Mantenimiento 123',
    client: 'Servicios 123',
    value: '$5,600',
    status: 'Activo',
    clientAvatar: '/avatars/a4.png',
    clientInitials: 'S1',
  },
  {
    id: '5',
    title: 'Contrato de Suministro QWE',
    client: 'Suministros QWE',
    value: '$16,200',
    status: 'Pendiente',
    clientAvatar: '/avatars/a5.png',
    clientInitials: 'SQ',
  },
];

export function RecentContracts({ className }: RecentContractsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Contratos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contract.clientAvatar} alt={contract.client} />
                      <AvatarFallback>{contract.clientInitials}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{contract.client}</div>
                  </div>
                </TableCell>
                <TableCell>{contract.title}</TableCell>
                <TableCell>{contract.value}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                  ${
                    contract.status === 'Activo' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : contract.status === 'Pendiente' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {contract.status}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 