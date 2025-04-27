"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { AlertCircle, Plus, Search, Filter, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Spinner } from "../../components/ui/spinner";
import { PermissionGate } from "../../components/auth/permission-gate";
import { getContracts } from "../../lib/api";
import type { Contract } from "../../types/index";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const router = useRouter();

  // Cargar contratos cuando cambian los filtros o al iniciar
  useEffect(() => {
    fetchContracts();
  }, [statusFilter, searchTerm]);

  // Si decides mantener el filtrado en cliente, puedes dejar este useEffect
  // Si prefieres que el servidor maneje todo el filtrado, puedes remover esto
  useEffect(() => {
    filterContracts();
  }, [contracts, searchTerm, statusFilter]);

  // Importar debounce de alguna librería como lodash o implementar uno personalizado
  const fetchContracts = async () => {
    try {
      setIsLoading(true);

      // Pequeño delay para evitar llamadas innecesarias durante la escritura
      const response = await getContracts({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm.trim() || undefined,
      });

      setContracts(response.data);
      setFilteredContracts(response.data);
    } catch (error) {
      console.error("Error al obtener contratos:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los contratos",
        variant: "destructive",
      });
      setContracts([]);
      setFilteredContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para filtrar contratos
  const filterContracts = () => {
    let filtered = [...contracts];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (contract) =>
          contract.title.toLowerCase().includes(term) ||
          (contract.description &&
            contract.description.toLowerCase().includes(term))
      );
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (contract) => contract.status === statusFilter
      );
    }

    setFilteredContracts(filtered);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Función para obtener el nombre del estado
  const getStatusName = (status: string) => {
    const statusMap: Record<string, { name: string; color: string }> = {
      draft: { name: "Borrador", color: "bg-gray-200 text-gray-800" },
      pending_approval: {
        name: "Pendiente de aprobación",
        color: "bg-yellow-200 text-yellow-800",
      },
      active: { name: "Activo", color: "bg-green-200 text-green-800" },
      expired: { name: "Expirado", color: "bg-red-200 text-red-800" },
      terminated: { name: "Terminado", color: "bg-red-200 text-red-800" },
      archived: { name: "Archivado", color: "bg-blue-200 text-blue-800" },
    };

    return (
      statusMap[status] || { name: status, color: "bg-gray-200 text-gray-800" }
    );
  };

  // Implementación de debounce para el término de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contratos</h1>
        <PermissionGate resource="contracts" action="create">
          <Button onClick={() => router.push("/contracts/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contrato
          </Button>
        </PermissionGate>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar contratos..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por estado" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="pending_approval">
                Pendiente de aprobación
              </SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
              <SelectItem value="terminated">Terminado</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {filteredContracts.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sin resultados</AlertTitle>
              <AlertDescription>
                No se encontraron contratos que coincidan con los criterios de
                búsqueda.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContracts.map((contract) => {
                const statusInfo = getStatusName(contract.status);
                return (
                  <Card
                    key={contract.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/contracts/${contract.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">
                          {contract.title}
                        </CardTitle>
                        <Badge className={statusInfo.color}>
                          {statusInfo.name}
                        </Badge>
                      </div>
                      <CardDescription>
                        {contract.description
                          ? contract.description.length > 100
                            ? contract.description.substring(0, 100) + "..."
                            : contract.description
                          : "Sin descripción"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            Fecha de inicio:
                          </span>
                          <span>{formatDate(contract.startDate)}</span>
                        </div>
                        {contract.endDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">
                              Fecha de finalización:
                            </span>
                            <span>{formatDate(contract.endDate)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Propietario:</span>
                          <span>
                            {typeof contract.owner === "object"
                              ? contract.owner.name
                              : "Desconocido"}
                          </span>
                        </div>
                        {contract.documentUrl && (
                          <div className="flex items-center text-blue-600 mt-2">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>Documento disponible</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
