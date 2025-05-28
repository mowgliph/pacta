import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useContracts } from "@/lib/useContracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SelectContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Contract = {
  id: string;
  number: string;
  company: string;
  startDate: string;
  endDate: string;
  status: string;
};

export function SelectContractModal({ isOpen, onClose }: SelectContractModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const { contracts, loading, error } = useContracts();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Asegurarse de que contracts sea un array antes de usar filter
  const filteredContracts = Array.isArray(contracts) 
    ? contracts.filter(
        (contract) =>
          contract?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract?.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSelectContract = (contract: Contract) => {
    setSelectedContract(contract);
  };

  const handleContinue = () => {
    if (selectedContract) {
      navigate(`/contracts/${selectedContract.id}/supplements/new`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-4xl max-h-[80vh] flex flex-col"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#001B48]">
            Seleccionar Contrato
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Elija el contrato al que desea agregar un suplemento.
          </p>
          <p id="dialog-description" className="sr-only">
            Se mostrará una lista de contratos. Use la barra de búsqueda para filtrar y seleccione un contrato para continuar con la creación de un suplemento.
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por número de contrato o empresa..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-md overflow-hidden flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : filteredContracts.length > 0 ? (
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50">
                  <TableRow>
                    <TableHead>Seleccionar</TableHead>
                    <TableHead>N° Contrato</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow
                      key={contract.id}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        selectedContract?.id === contract.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleSelectContract(contract as Contract)}
                    >
                      <TableCell>
                        <input
                          type="radio"
                          name="contract"
                          checked={selectedContract?.id === contract.id}
                          onChange={() => handleSelectContract(contract as Contract)}
                          className="h-4 w-4 text-primary"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{contract.number}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'No se encontraron contratos que coincidan con la búsqueda'
                    : 'No hay contratos disponibles'}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Intenta crear un nuevo contrato si aún no hay ninguno
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedContract}
            className="bg-[#018ABE] hover:bg-[#016f9c]"
          >
            Continuar con el suplemento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
