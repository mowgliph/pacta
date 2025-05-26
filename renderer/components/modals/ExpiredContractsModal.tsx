import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ExternalLink, Search } from "lucide-react";
import { Contract } from "@/lib/useContracts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ExpiredContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  onExportPDF: (contracts: Contract[]) => Promise<void>;
}

const PAGE_SIZE = 5;

const ExpiredContractsModal: React.FC<ExpiredContractsModalProps> = ({
  isOpen,
  onClose,
  contracts,
  loading,
  error,
  onExportPDF,
}) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [exporting, setExporting] = React.useState(false);

  // Filtrar contratos por búsqueda
  const filteredContracts = contracts.filter(
    (c) => {
      const searchLower = search.toLowerCase();
      return (
        (c.number?.toLowerCase?.().includes(searchLower) ?? false) ||
        (c.company?.toLowerCase?.().includes(searchLower) ?? false) ||
        (c.description?.toLowerCase?.().includes(searchLower) ?? false)
      );
    }
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
      alert("No hay contratos vencidos para exportar con los filtros actuales");
      return;
    }

    setExporting(true);
    try {
      await onExportPDF(filteredContracts);
    } catch (err) {
      console.error("Error al exportar:", err);
    } finally {
      setExporting(false);
    }
  };

  // Navegar a la vista de contratos con filtro de vencidos
  const navigateToExpiredContracts = () => {
    navigate("/contracts?status=Vencido");
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
            Contratos Vencidos
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
            aria-label="Buscar contratos vencidos"
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
              {search
                ? "No se encontraron contratos que coincidan con la búsqueda."
                : "No hay contratos vencidos para mostrar."}
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
                      Vencido el: {new Date(contract.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  {contract.description && (
                    <div className="mt-2 text-sm text-[#757575] line-clamp-1">
                      {contract.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-[#757575]">
            {!loading && !error && filteredContracts.length > 0 && (
              <span>
                Mostrando {paginatedContracts.length} de {filteredContracts.length} contratos
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={navigateToExpiredContracts}
              className="flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Ver todos
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={loading || exporting || filteredContracts.length === 0}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <Spinner size="sm" />
                  Exportando...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpiredContractsModal;
