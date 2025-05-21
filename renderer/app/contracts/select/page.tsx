import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useContracts } from "@/lib/useContracts";

type Contract = {
  id: string;
  number: string;
  company: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
};

export default function SelectContractPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  
  // Usar el hook useContracts para obtener la lista de contratos
  const { contracts, loading, error } = useContracts();
  
  // Filtrar contratos basados en el término de búsqueda
  const filteredContracts = contracts.filter(
    (contract) =>
      contract.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.company.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Mostrar mensaje de error si hay un problema al cargar los contratos
  if (error) {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  }

  const handleSelectContract = () => {
    if (selectedContractId) {
      navigate(`/contracts/${selectedContractId}/supplements/new`);
    } else {
      toast({
        title: "Selección requerida",
        description: "Por favor, seleccione un contrato para continuar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Contrato</CardTitle>
          <p className="text-sm text-muted-foreground">
            Seleccione el contrato al que desea agregar un suplemento.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por número de contrato o nombre del cliente..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSelectContract}
              disabled={!selectedContractId}
            >
              Seleccionar
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seleccionar</TableHead>
                    <TableHead>Número de Contrato</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.length > 0 ? (
                    filteredContracts.map((contract) => (
                      <TableRow
                        key={contract.id}
                        className={`cursor-pointer hover:bg-muted/50 ${
                          selectedContractId === contract.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedContractId(contract.id)}
                      >
                        <TableCell>
                          <input
                            type="radio"
                            name="contract"
                            checked={selectedContractId === contract.id}
                            onChange={() => setSelectedContractId(contract.id)}
                            className="h-4 w-4 text-primary"
                          />
                        </TableCell>
                        <TableCell>{contract.number}</TableCell>
                        <TableCell>{contract.company}</TableCell>
                        <TableCell>
                          {new Date(contract.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(contract.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              contract.status === "Vigente"
                                ? "bg-green-100 text-green-800"
                                : contract.status === "Próximo a Vencer"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {contract.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No se encontraron contratos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
