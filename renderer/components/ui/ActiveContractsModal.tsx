import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, ExternalLink, Search } from "lucide-react";
import { Contract } from "@/lib/useContracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Spinner } from "./spinner";

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
const ActiveContractsModal = ({
  isOpen,
  onClose,
  title = "Contratos Vigentes",
}: ActiveContractsModalProps) => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // Cargar contratos vigentes cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    const fetchActiveContracts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await window.Electron?.ipcRenderer.invoke<{ data: Contract[] }>(
          "contracts:list",
          { status: "Vigente" }
        );
        
        if (response) {
          setContracts(response.data || []);
        } else {
          throw new Error("No se pudieron obtener los contratos vigentes");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar contratos");
        console.error("Error al cargar contratos vigentes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveContracts();
  }, [isOpen]);

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
      // Diálogo para guardar archivo
      const fileResult = await window.Electron?.files.save({
        title: "Exportar contratos vigentes como PDF",
        defaultPath: `Contratos_Vigentes_${new Date().toISOString().slice(0, 10)}.pdf`,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });

      if (!fileResult?.filePath) {
        return;
      }

      // Llamada IPC para exportar solo los contratos filtrados
      await window.Electron?.ipcRenderer.invoke("reports:exportActiveContracts", {
        filePath: fileResult.filePath,
        contractIds: filteredContracts.map(c => c.id)
      });

      // Notificar éxito (se podría implementar un toast)
      alert(`Se exportaron ${filteredContracts.length} contratos correctamente.`);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#001B48]">
            {title}
          </DialogTitle>
        </DialogHeader>

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

        {/* Acciones del pie */}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={loading || exporting || paginatedContracts.length === 0}
            className="flex items-center gap-1"
          >
            <Download size={16} />
            {exporting ? "Exportando..." : "Exportar PDF"}
          </Button>
          <Button onClick={navigateToContracts} className="flex items-center gap-1">
            <ExternalLink size={16} />
            Ver todos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActiveContractsModal;

