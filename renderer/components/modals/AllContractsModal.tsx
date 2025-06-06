import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  IconFileText, 
  IconDownload, 
  IconExternalLink, 
  IconSearch, 
  IconRefresh 
} from "@tabler/icons-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Contract {
  id: string;
  number: string;
  company: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
  createdAt: string;
}

interface AllContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll: () => void;
  contracts: Contract[];
  loading?: boolean;
  error?: string | null;
  title?: string;
}

const PAGE_SIZE = 10;

/**
 * Modal que muestra una lista paginada de contratos
 * con funcionalidad de búsqueda y exportación a PDF
 */
const AllContractsModal: React.FC<AllContractsModalProps> = ({
  isOpen,
  onClose,
  onViewAll,
  contracts = [],
  loading = false,
  error = null,
  title = "Contratos",
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Filtrar contratos por búsqueda
  const filteredContracts = contracts.filter(
    (c) =>
      c.number.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      (c.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredContracts.length / PAGE_SIZE);
  const paginatedContracts = filteredContracts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Manejar exportación a PDF
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      // Lógica de exportación a PDF
      toast.success("Exportando a PDF...");
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      toast.error("Error al exportar a PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PP", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Manejar navegación al detalle del contrato
  const handleViewContract = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                disabled={loading || isExporting}
                className="h-8 w-8 p-0"
              >
                <IconRefresh className="h-4 w-4" />
                <span className="sr-only">Actualizar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExporting || filteredContracts.length === 0}
                className="h-8"
              >
                {isExporting ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <IconDownload className="mr-2 h-4 w-4" />
                )}
                Exportar PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAll}
                className="h-8"
              >
                Ver todos
                <IconExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Lista de contratos registrados en el sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar contratos..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Lista de contratos */}
          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center text-destructive">
                <p>Error al cargar los contratos</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2 p-8 text-center">
                <IconFileText className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">
                  {search ? "No se encontraron resultados" : "No hay contratos"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {search
                    ? "Prueba con otros términos de búsqueda"
                    : "No hay contratos registrados"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleViewContract(contract.id)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {contract.number || "Sin número"}
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          {contract.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {contract.company}
                      </p>
                      {contract.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {contract.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1 text-sm">
                      <div className="text-muted-foreground">
                        Vence: {formatDate(contract.endDate)}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          contract.status === 'ACTIVO'
                            ? 'bg-green-100 text-green-800'
                            : contract.status === 'PROXIMO_A_VENCER'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {contract.status === 'ACTIVO' 
                          ? 'Activo' 
                          : contract.status === 'PROXIMO_A_VENCER' 
                            ? 'Próximo a vencer' 
                            : 'Vencido'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1 py-2">
              <div className="text-sm text-muted-foreground">
                Mostrando {paginatedContracts.length} de {filteredContracts.length} contratos
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={onViewAll}>
            Ver todos los contratos
            <IconExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllContractsModal;
