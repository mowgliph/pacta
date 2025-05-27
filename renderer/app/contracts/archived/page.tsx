import { useState, useEffect, ChangeEvent } from "react";
import { useArchivedContracts } from "@/lib/useArchivedContracts";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Archive, ExternalLink, RotateCcw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Definir el tipo para el evento de cambio de input
type InputChangeEvent = ChangeEvent<HTMLInputElement>;

export default function ArchivedContractsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const {
    archivedContracts,
    loading,
    error,
    pagination,
    fetchArchivedContracts,
    restoreContract,
  } = useArchivedContracts();

  // Cargar contratos archivados al montar el componente
  useEffect(() => {
    const loadArchivedContracts = async () => {
      try {
        await fetchArchivedContracts(page, limit, search);
      } catch (err) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los contratos archivados",
          variant: "destructive",
        });
      }
    };

    loadArchivedContracts();
  }, [page, search, fetchArchivedContracts, toast]);

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        fetchArchivedContracts(1, limit, search);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search, page, fetchArchivedContracts]);

  const handleRestore = async (contractId: string) => {
    try {
      await restoreContract(contractId);
      toast({
        title: "Contrato restaurado",
        description: "El contrato ha sido restaurado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo restaurar el contrato",
        variant: "destructive",
      });
    }
  };

  if (loading && !archivedContracts.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <h3 className="font-medium">Error al cargar los contratos archivados</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Contratos Archivados</h1>
          <p className="text-muted-foreground">
            Gestiona los contratos que han sido archivados en el sistema.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contratos..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {archivedContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <Archive className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No hay contratos archivados</h3>
              <p className="text-sm text-muted-foreground">
                Los contratos que se archiven aparecerán aquí.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {archivedContracts.map((contract) => (
                  <Card key={contract.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-medium">
                            {contract.contractNumber}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {contract.companyName}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          Archivado
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tipo</span>
                          <span className="font-medium">{contract.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Inicio</span>
                          <span>
                            {format(new Date(contract.startDate), "PP", { locale: es })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vence</span>
                          <span>
                            {format(new Date(contract.endDate), "PP", { locale: es })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Archivado</span>
                          <span>
                            {format(new Date(contract.updatedAt), "PPp", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(contract.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Spinner className="mr-2 h-4 w-4" />
                        ) : (
                          <RotateCcw className="mr-2 h-4 w-4" />
                        )}
                        Restaurar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/contracts/${contract.id}`, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          className={page === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        // Mostrar páginas alrededor de la página actual
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                e.preventDefault();
                                setPage(pageNum);
                              }}
                              isActive={page === pageNum}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            if (page < pagination.totalPages) setPage(page + 1);
                          }}
                          className={page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
