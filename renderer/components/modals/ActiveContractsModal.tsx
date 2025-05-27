import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, ExternalLink, Search } from "lucide-react";
import { Contract } from "@/lib/useContracts";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ActiveContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  contracts: Contract[];
  onExportPDF: (contracts: Contract[]) => Promise<void>;
}

const PAGE_SIZE = 5;

/**
 * Modal que muestra una lista paginada de contratos vigentes
 * Permite exportar a PDF y redirigir a la página de contratos
 */
const ActiveContractsModal: React.FC<ActiveContractsModalProps> = ({
  isOpen,
  onClose,
  title = "Contratos Vigentes",
  contracts: initialContracts,
  onExportPDF
}) => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>(initialContracts || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // Usar los contratos pasados como prop
  useEffect(() => {
    if (!isOpen) return;
    setContracts(initialContracts || []);
    setLoading(false);
  }, [isOpen, initialContracts]);

  // Filtrar contratos por búsqueda
  const filteredContracts = contracts.filter(
    (c) =>
      c.number.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredContracts.length / PAGE_SIZE);
  const paginatedContracts = filteredContracts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Manejar exportación a PDF
  const handleExportPDF = async () => {
    if (filteredContracts.length === 0) {
      alert("No hay contratos para exportar con los filtros actuales");
      return;
    }

    setExporting(true);
    try {
      // Exportar contratos usando el canal directo
      const result = await window.electron.ipcRenderer.invoke(
        "export:pdf",
        {
          data: filteredContracts,
          template: 'contracts-active'
        }
      );

      if (!result?.success) {
        alert("Error al exportar los contratos: " + (result?.error?.message || "Error desconocido"));
        return;
      }

      // Mostrar mensaje de éxito
      alert("Contratos exportados exitosamente");
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert(`Error al exportar el reporte: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setExporting(false);
    }
  };

  // Navegar a la vista de contratos
  const navigateToContracts = () => {
    navigate("/contracts");
    onClose();
  };

  // Ver detalle de un contrato específico
  const viewContractDetail = (id: string) => {
    navigate(`/contracts/${id}`);
    onClose();
  };

  const titleId = 'active-contracts-title';
  const descriptionId = 'active-contracts-description';

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:max-w-[600px] sm:rounded-lg"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <div className="flex flex-col space-y-1.5">
            <h2 id={titleId} className="text-xl font-semibold text-[#001B48] leading-none tracking-tight">
              {title}
            </h2>
            <p id={descriptionId} className="sr-only">
              Lista de contratos vigentes con opciones para ver detalles y exportar
            </p>
            <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <Cross2Icon className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Dialog.Close>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex items-center bg-white rounded-lg border border-[#E5E5E5] px-3 py-2 gap-2 mb-4">
            <Search size={18} className="text-[#757575]" />
            <input
              type="text"
              placeholder="Buscar por número, empresa o descripción..."
              className="outline-none border-none bg-transparent text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar contratos"
            />
          </div>

          {/* Contenido principal */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-[#F44336] p-4 bg-[#F44336]/10 rounded-md">
                {error}
              </div>
            ) : paginatedContracts.length === 0 ? (
              <div className="text-[#757575] text-center py-8">
                No se encontraron contratos vigentes.
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="bg-[#F9FBFC] p-4 rounded-lg border border-[#E5E5E5] hover:border-[#018ABE] transition-colors cursor-pointer"
                    onClick={() => viewContractDetail(contract.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") viewContractDetail(contract.id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-[#001B48]">
                          {contract.number}
                        </h3>
                        <p className="text-sm text-[#757575]">{contract.company}</p>
                      </div>
                      <div className="text-sm text-[#757575]">
                        {new Date(contract.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-[#757575] line-clamp-1">
                      {contract.description}
                    </div>
                    <div className="mt-2 text-right text-sm font-medium text-[#018ABE]">
                      {contract.amount.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paginación */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded bg-[#D6E8EE] text-[#001B48] disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <span className="px-2 text-sm text-[#757575]">
                Página {page} de {totalPages}
              </span>
              <button
                className="px-3 py-1 rounded bg-[#D6E8EE] text-[#001B48] disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Pie de diálogo */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={navigateToContracts}
              className="flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Ver todos los contratos
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={exporting || filteredContracts.length === 0}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Exportar a PDF
                </>
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ActiveContractsModal;
