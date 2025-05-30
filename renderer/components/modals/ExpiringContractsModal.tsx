import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileTextIcon, 
  EyeOpenIcon, 
  ExternalLinkIcon, 
  ExclamationTriangleIcon 
} from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import type { Contract } from "../../lib/useContracts";
import { toast } from "sonner";

interface ExpiringContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: Contract[];
  loading?: boolean;
  error?: string | null;
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
  title = "Contratos Próximos a Vencer"
}) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

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
    if (!id) {
      console.error("ID de contrato no válido");
      return;
    }
    navigate(`/contracts/${id}`);
    onClose();
  };

  // Manejar exportación a PDF
  const handleExportPDF = async () => {
    if (contracts.length === 0) {
      toast.error("No hay contratos para exportar");
      return;
    }
    
    try {
      setIsExporting(true);
      const result = await window.electron.ipcRenderer.invoke("export:pdf", {
        data: contracts,
        template: "contracts-expiring",
      });

      if (!result?.success) {
        throw new Error(result?.error?.message || "Error desconocido al exportar");
      }
      
      toast.success("Contratos exportados exitosamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error(
        `Error al exportar: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setIsExporting(false);
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
      <DialogContent className="sm:max-w-[700px]" aria-describedby="expiring-contracts-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#001B48] font-inter">
            {title}
          </DialogTitle>
          <DialogDescription id="expiring-contracts-description">
            Lista de contratos próximos a vencer con opciones de exportación y navegación.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#018ABE]"></div>
              <p className="text-[#757575]">Cargando contratos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex flex-col space-y-2">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Error al cargar los contratos</span>
              </div>
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Reintentar
              </button>
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
                            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
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
                              <EyeOpenIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleExportPDF}
                              disabled={contracts.length === 0 || isExporting}
                              className="flex items-center gap-2"
                            >
                              {isExporting ? (
                                <span className="animate-spin">
                                  <ExclamationTriangleIcon className="w-4 h-4" />
                                </span>
                              ) : (
                                <FileTextIcon className="w-4 h-4" />
                              )}
                              {isExporting ? 'Exportando...' : 'Exportar a PDF'}
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
            disabled={loading || isExporting || contracts.length === 0}
            className="h-10 px-4 flex items-center gap-1"
            aria-label="Exportar contratos próximos a vencer a PDF"
          >
            <FileTextIcon className="h-4 w-4" />
            {isExporting ? "Exportando..." : "Exportar PDF"}
          </Button>
          <Button
            onClick={handleViewAllContracts}
            className="h-10 px-4 bg-[#FF9800] hover:bg-[#F57C00] text-white flex items-center gap-1"
            aria-label="Ver todos los contratos próximos a vencer"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Ver todos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpiringContractsModal;

