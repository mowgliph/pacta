import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Contract {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface RecentContractsTableProps {
  contracts: Contract[];
}

export function RecentContractsTable({ contracts }: RecentContractsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.name}</TableCell>
                <TableCell>{contract.type}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      contract.status === "active"
                        ? "bg-green-100 text-green-800"
                        : contract.status === "expired"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {contract.status === "active"
                      ? "Activo"
                      : contract.status === "expired"
                      ? "Expirado"
                      : "Pendiente"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(contract.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(contract.endDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
