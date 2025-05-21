import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Eye, ExternalLink, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Contract } from "../../lib/useContracts";

interface ExpiringContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: Contract[];
  loading?: boolean;
  error?: string | null;
  onExportPDF: (contracts: Contract[]) => Promise<void>;
  title?: string;
}

const PAGE_SIZE = 5;

/**
 * Modal que muestra la lista de contratos próximos a vencer con paginación
 * Permite exportar a PDF y ver detalles
 */
const ExpiringContractsModal: React.FC<ExpiringContractsModalProps> = ({
  isOpen,
  onClose,
  contracts,
  loading = false,
  error = null,
  onExportPDF,
  title = "Contratos Próximos a Vencer"
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Calcular paginación
  const totalPages = Math.ceil(contracts.length / PAGE_SIZE);
  const paginatedContracts = contracts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Ver todos los contratos próximos a vencer
  const handleViewAllContracts = () => {
    navigate("/contracts?filter=expiring");
    onClose();
  };

  // Ver detalle de un contrato específico
  const handleViewContractDetail = (id: string) => {
    navigate(`/contracts/${id}`);
    onClose();
  };

  // Exportar a PDF
  const handleExportPDF = async () => {
    if (contracts.length === 0) return;
    
    setExporting(true);
    try {
      await onExportPDF(contracts);
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  // Calcular días restantes
  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#001B48] font-inter">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9800]"></div>
            </div>
          ) : error ? (
            <div className="bg-[#F44336]/10 text-[#F44336] p-4 rounded-lg text-sm">
              {error}
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-10 text-[#757575] font-roboto">
              No hay contratos próximos a vencer para mostrar
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#D6E8EE] text-[#001B48]">
                    <th className="px-4 py-2 text-left font-medium">Número</th>
                    <th className="px-4 py-2 text-left font-medium">Empresa</th>
                    <th className="px-4 py-2 text-left font-medium">Fecha Venc.</th>
                    <th className="px-4 py-2 text-left font-medium">Días Rest.</th>
                    <th className="px-4 py-2 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContracts.map((contract) => {
                    const daysRemaining = getDaysRemaining(contract.endDate);
                    
                    return (
                      <tr
                        key={contract.id}
                        className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors"
                      >
                        <td className="px-4 py-2">{contract.number}</td>
                        <td className="px-4 py-2">{contract.company}</td>
                        <td className="px-4 py-2">
                          {new Date(contract.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <span className="flex items-center gap-1 text-[#FF9800] font-medium">
                            <AlertTriangle size={14} />
                            {daysRemaining} días
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewContractDetail(contract.id)}
                              className="h-8 px-2 text-[#018ABE]"
                              aria-label={`Ver detalle del contrato ${contract.number}`}
                            >
                              <Eye size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="h-8 px-3"
              aria-label="Página anterior"
            >
              Anterior
            </Button>
            <span className="inline-flex items-center px-2 text-sm text-[#757575]">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="h-8 px-3"
              aria-label="Página siguiente"
            >
              Siguiente
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={loading || exporting || contracts.length === 0}
            className="h-10 px-4 flex items-center gap-1"
            aria-label="Exportar contratos próximos a vencer a PDF"
          >
            <FileDown size={16} />
            {exporting ? "Exportando..." : "Exportar PDF"}
          </Button>
          <Button
            onClick={handleViewAllContracts}
            className="h-10 px-4 bg-[#FF9800] hover:bg-[#F57C00] text-white flex items-center gap-1"
            aria-label="Ver todos los contratos próximos a vencer"
          >
            <ExternalLink size={16} />
            Ver todos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpiringContractsModal;

