import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileTextIcon, DownloadIcon, ExternalLinkIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Contract } from "@/lib/useContracts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface AllContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll: () => void;
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  title?: string;
}

const PAGE_SIZE = 5;

/**
 * Modal que muestra una lista paginada de todos los contratos
 * Permite exportar a PDF y redirigir a la página de contratos
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
    if (filteredContracts.length === 0) {
      toast.error("No hay contratos para exportar");
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Obtener la ruta del archivo usando el canal IPC
      const result = await window.electron.ipcRenderer.invoke(
        "dialog:save-file",
        {
          title: "Exportar contratos como PDF",
          defaultPath: `Contratos_${new Date().toISOString().slice(0, 10)}.pdf`,
          filters: [{ name: "PDF", extensions: ["pdf"] }],
        }
      );

      if (!result?.success || !result?.filePath) {
        return; // Usuario canceló el diálogo
      }

      // Exportar contratos usando el canal de reportes
      const exportResult = await window.electron.ipcRenderer.invoke(
        "export:pdf",
        {
          data: filteredContracts,
          template: "contracts-all",
          filePath: result.filePath,
        }
      );

      if (!exportResult?.success) {
        throw new Error(exportResult?.error?.message || "Error al exportar los contratos");
      }
      
      toast.success(`Se exportaron ${filteredContracts.length} contratos correctamente`);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error(
        `Error al exportar: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Manejar clic en ver todos
  const handleViewAll = () => {
    onClose();
    onViewAll();
  };

  // Ver detalle de un contrato específico
  const viewContractDetail = (id: string) => {
    navigate(`/contracts/${id}`);
    onClose();
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]" aria-describedby="all-contracts-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#001B48] font-inter">
            {title}
          </DialogTitle>
          <DialogDescription id="all-contracts-description">
            Lista completa de contratos con opciones de búsqueda, filtrado y exportación.
          </DialogDescription>
        </DialogHeader>

        {/* Barra de búsqueda */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contratos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-azul-medio focus:border-transparent"
            />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="px-4 py-3">
          {loading ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">
              {error}
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-gray-500 text-center">
              No se encontraron contratos con los filtros actuales
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedContracts.map((contract) => (
                <div
                  key={contract.id || `contract-${contract.number}-${contract.company}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {contract.number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {contract.company}
                    </div>
                    <div className="text-xs text-gray-400">
                      {contract.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewContractDetail(contract.id)}
                    >
                      <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleViewAll}
              className="flex items-center gap-2"
            >
              <FileTextIcon className="w-5 h-5 text-azul-medio" />
              Ver todos los contratos
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={filteredContracts.length === 0 || isExporting}
              className="h-10 px-4 flex items-center gap-1"
            >
              {isExporting ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <DownloadIcon className="h-4 w-4" />
              )}
              {isExporting ? "Exportando..." : "Exportar PDF"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllContractsModal;
