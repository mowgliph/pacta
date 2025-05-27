import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, ExternalLink, Search, Archive } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { ArchivedContract } from "@/types/contracts";

interface ArchivedContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  contracts: ArchivedContract[];
  onExportPDF: (contracts: ArchivedContract[]) => Promise<void>;
  onRestoreContract?: (contractId: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const PAGE_SIZE = 5;

/**
 * Modal que muestra una lista paginada de contratos archivados
 * Permite exportar a PDF, restaurar contratos y redirigir a la página de contratos
 */
const ArchivedContractsModal: React.FC<ArchivedContractsModalProps> = ({
  isOpen,
  onClose,
  title = "Contratos Archivados",
  contracts: initialContracts,
  onExportPDF,
  onRestoreContract,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<ArchivedContract[]>(initialContracts || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  // Usar los contratos pasados como prop
  useEffect(() => {
    if (!isOpen) return;
    setContracts(initialContracts || []);
    setLoading(false);
  }, [isOpen, initialContracts]);

  // Formatear fecha de manera segura
  const formatDate = useCallback((date: string | Date | undefined): string => {
    if (!date) return 'Fecha no disponible';
    
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) 
      ? format(parsedDate, 'dd/MM/yyyy', { locale: es })
      : 'Fecha inválida';
  }, []);

  // Filtrar contratos por búsqueda
  const filteredContracts = React.useMemo(() => {
    // Asegurarse de que contracts sea un array antes de usar filter
    const contractsArray = Array.isArray(contracts) ? contracts : [];
    
    return contractsArray.filter((c) => {
      if (!c) return false; // Manejar elementos nulos/undefined
      
      const searchTerm = search.toLowerCase();
      const companyName = c.companyName || c.company || '';
      return (
        (c.contractNumber || c.number || '').toLowerCase().includes(searchTerm) ||
        companyName.toLowerCase().includes(searchTerm) ||
        (c.description || '').toLowerCase().includes(searchTerm)
      );
    });
  }, [contracts, search]);

  // Calcular paginación
  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / PAGE_SIZE));
  const paginatedContracts = React.useMemo(() => 
    filteredContracts.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    ),
    [filteredContracts, page]
  );

  // Resetear a la primera página cuando cambia la búsqueda
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Manejar exportación a PDF
  const handleExportPDF = async (): Promise<void> => {
    if (filteredContracts.length === 0) {
      toast({
        title: "No hay contratos para exportar",
        description: "No se encontraron contratos archivados para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setExporting(true);
      await onExportPDF(filteredContracts);
      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${filteredContracts.length} contratos correctamente`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast({
        title: "Error al exportar",
        description: `No se pudo exportar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Manejar restauración de contrato
  const handleRestoreContract = async (contractId: string): Promise<void> => {
    if (!onRestoreContract) return;
    
    try {
      setRestoring(contractId);
      await onRestoreContract(contractId);
      
      // Actualizar la lista eliminando el contrato restaurado
      setContracts(prev => prev.filter(c => c.id !== contractId));
      
      // Mostrar notificación de éxito
      toast({
        title: "Contrato restaurado",
        description: "El contrato ha sido restaurado exitosamente",
        variant: "default",
      });
    } catch (err) {
      console.error("Error al restaurar contrato:", err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toast({
        title: "Error al restaurar",
        description: `No se pudo restaurar el contrato: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  // Navegar a la vista de contratos
  const navigateToContracts = (): void => {
    navigate("/contracts");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-lg shadow-lg z-50 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Archive className="w-5 h-5" />
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-500"
                aria-label="Cerrar"
              >
                <Cross2Icon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contratos..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Spinner className="w-8 h-8" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : filteredContracts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron contratos archivados
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {(contract.contractNumber || contract.number || 'Sin número')} - {contract.companyName || contract.company || 'Sin compañía'}
                        </h3>
                        {contract.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {contract.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                          </span>
                          <span className="inline-flex items-center">
                            <Archive className="h-3 w-3 mr-1" />
                            Archivado el: {formatDate(contract.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {onRestoreContract && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreContract(contract.id)}
                            disabled={restoring === contract.id}
                          >
                            {restoring === contract.id ? (
                              <Spinner className="mr-2 h-4 w-4" />
                            ) : (
                              <Archive className="mr-2 h-4 w-4" />
                            )}
                            Restaurar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/contracts/${contract.id}`)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-gray-500">
              Mostrando {paginatedContracts.length} de {filteredContracts.length} contratos
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {page} de {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>

          <div className="flex justify-between p-4 border-t">
            <Button variant="outline" onClick={navigateToContracts}>
              Ir a Contratos
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handleExportPDF}
                disabled={filteredContracts.length === 0 || exporting}
              >
                {exporting ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Exportar PDF
              </Button>
              <Button onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ArchivedContractsModal;
