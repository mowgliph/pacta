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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../..//components/ui/dialog";
import {
  AlertCircle,
  Edit,
  Trash,
  FileText,
  Clock,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Spinner } from "../../components/ui/spinner";
import { PermissionGate } from "../../components/auth/permission-gate";
import { ContractPermissions } from "../../components/contracts/contract-permissions";
import {
  getContractById,
  deleteContract,
  updateContractStatus,
} from "../../lib/api";
import type { Contract } from "../../types/index";

export default function ContractDetailsPage() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const router = useRouter();
  const { id } = router.query;

  // Cargar contrato al iniciar
  useEffect(() => {
    if (id) {
      fetchContract();
    }
  }, [id]);

  // Función para obtener contrato
  const fetchContract = async () => {
    if (!id || Array.isArray(id)) return;

    try {
      setIsLoading(true);
      const contractData = await getContractById(id);
      setContract(contractData);
    } catch (error: any) {
      console.error("Error al cargar el contrato:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar el contrato",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar contrato
  const handleDeleteContract = async () => {
    if (!contract || !contract.id) return;

    try {
      setIsLoading(true);
      await deleteContract(contract.id);

      toast({
        title: "Éxito",
        description: "El contrato fue eliminado correctamente",
      });
      router.push("/contracts");
    } catch (error: any) {
      console.error("Error al eliminar el contrato:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el contrato",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Función para aprobar contrato
  const approveContract = async () => {
    if (!contract || !contract.id) return;

    try {
      setIsLoading(true);
      await updateContractStatus(contract.id, "active");

      toast({
        title: "Éxito",
        description: "El contrato fue aprobado correctamente",
      });
      setIsApproveDialogOpen(false);
      // Refrescar los datos del contrato
      await fetchContract();
    } catch (error: any) {
      console.error("Error al aprobar el contrato:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo aprobar el contrato",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  // Función para obtener el nombre de la acción
  const getActionName = (action: string) => {
    const actionMap: Record<string, string> = {
      created: "Creación",
      updated: "Actualización",
      approved: "Aprobación",
      assigned_users: "Asignación de usuarios",
      status_changed: "Cambio de estado",
    };

    return actionMap[action] || action;
  };

  if (isLoading && !contract) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudo cargar el contrato solicitado.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/contracts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a contratos
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusName(contract.status);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push("/contracts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">{contract.title}</h1>
          <Badge className={statusInfo.color}>{statusInfo.name}</Badge>
        </div>
        <div className="flex space-x-2">
          <PermissionGate resource="contracts" action="update">
            <Button
              onClick={() => router.push(`/contracts/edit/${contract.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </PermissionGate>

          {contract.status === "draft" ||
          contract.status === "pending_approval" ? (
            <PermissionGate resource="contracts" action="approve">
              <Button
                variant="default"
                onClick={() => setIsApproveDialogOpen(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobar
              </Button>
            </PermissionGate>
          ) : null}

          <PermissionGate resource="contracts" action="delete">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </PermissionGate>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="parties">Partes</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <PermissionGate resource="contracts" action="assign">
            <TabsTrigger value="permissions">Permisos</TabsTrigger>
          </PermissionGate>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Contrato</CardTitle>
              <CardDescription>
                Información general sobre el contrato.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Información Básica
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Título:</span>{" "}
                      {contract.title}
                    </div>
                    <div>
                      <span className="font-medium">Descripción:</span>{" "}
                      {contract.description || "Sin descripción"}
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span>{" "}
                      {statusInfo.name}
                    </div>
                    <div>
                      <span className="font-medium">Fecha de inicio:</span>{" "}
                      {formatDate(contract.startDate)}
                    </div>
                    <div>
                      <span className="font-medium">
                        Fecha de finalización:
                      </span>{" "}
                      {contract.endDate
                        ? formatDate(contract.endDate)
                        : "Sin definir"}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Información Financiera
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Valor:</span>{" "}
                      {contract.value
                        ? `${contract.value.amount.toLocaleString()} ${
                            contract.value.currency
                          }`
                        : "Sin definir"}
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mt-6 mb-2">
                    Información Adicional
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Propietario:</span>{" "}
                      {typeof contract.owner === "object"
                        ? contract.owner.name
                        : "Desconocido"}
                    </div>
                    <div>
                      <span className="font-medium">Creado por:</span>{" "}
                      {typeof contract.createdBy === "object"
                        ? contract.createdBy.name
                        : "Desconocido"}
                    </div>
                    <div>
                      <span className="font-medium">Fecha de creación:</span>{" "}
                      {formatDate(contract.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Última actualización:</span>{" "}
                      {formatDate(contract.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {contract.documentUrl && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Documento</h3>
                  <Button
                    variant="outline"
                    onClick={() => window.open(contract.documentUrl, "_blank")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Ver documento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parties">
          <Card>
            <CardHeader>
              <CardTitle>Partes del Contrato</CardTitle>
              <CardDescription>
                Entidades involucradas en este contrato.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contract.parties && contract.parties.length > 0 ? (
                <div className="space-y-4">
                  {contract.parties.map((party, index) => (
                    <div key={index} className="border p-4 rounded-md">
                      <div className="font-medium text-lg">{party.name}</div>
                      <div className="text-sm text-gray-500">
                        Rol: {party.role}
                      </div>
                      {party.contact && (
                        <div className="text-sm">Contacto: {party.contact}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sin partes</AlertTitle>
                  <AlertDescription>
                    No hay partes definidas para este contrato.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Corregir la sección del historial */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial del Contrato</CardTitle>
              <CardDescription>
                Registro de cambios y acciones realizadas en este contrato.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contract.history && contract.history.length > 0 ? (
                <div className="space-y-4">
                  {contract.history.map((entry, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-medium">
                          {getActionName(entry.action)}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      {entry.user && (
                        <div className="text-sm mt-1">
                          Por:{" "}
                          {typeof entry.user === "object"
                            ? entry.user.name
                            : entry.user}
                        </div>
                      )}
                      {entry.description && (
                        <div className="text-sm mt-1">{entry.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sin historial</AlertTitle>
                  <AlertDescription>
                    No hay registros de historial para este contrato.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TabsContent para permisos */}
        <TabsContent value="permissions">
          <ContractPermissions contract={contract} onUpdate={fetchContract} />
        </TabsContent>
      </Tabs>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el contrato "{contract.title}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContract}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Spinner className="mr-2" />
                  <span>Eliminando...</span>
                </div>
              ) : (
                <span>Eliminar</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar aprobación */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar aprobación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea aprobar el contrato "{contract.title}"?
              El estado cambiará a "Activo".
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={approveContract} disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <Spinner className="mr-2" />
                  <span>Aprobando...</span>
                </div>
              ) : (
                <span>Aprobar</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
