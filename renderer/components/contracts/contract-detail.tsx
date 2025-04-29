"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useContracts } from "../../hooks/useContracts";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Spinner } from "../ui/spinner";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Users,
  FileEdit,
  Download,
} from "lucide-react";
import { SupplementList } from "../supplements/supplement-list";
import { DocumentList } from "./document-list";
import { NewSupplementDialog } from "../supplements/NewSupplementDialog";
import { useRequireAuth } from "../../hooks/useRequireAuth";

interface ContractDetailProps {
  contractId: string;
}

export function ContractDetail({ contractId }: ContractDetailProps) {
  const { selectedContract, fetchContract } = useContracts();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isSupplementDialogOpen, setIsSupplementDialogOpen] = useState(false);
  const router = useRouter();
  const { requireAuth, AuthModal } = useRequireAuth();

  useEffect(() => {
    const loadContract = async () => {
      setIsLoading(true);
      await fetchContract(contractId);
      setIsLoading(false);
    };

    loadContract();
  }, [contractId, fetchContract]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Vigente":
        return <Badge className="bg-green-100 text-green-800">Vigente</Badge>;
      case "Próximo a Vencer":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Próximo a Vencer
          </Badge>
        );
      case "Vencido":
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
      case "Archivado":
        return <Badge className="bg-gray-100 text-gray-800">Archivado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Cliente":
        return <Badge className="bg-purple-100 text-purple-800">Cliente</Badge>;
      case "Proveedor":
        return <Badge className="bg-blue-100 text-blue-800">Proveedor</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No definida";
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", {
      locale: es,
    });
  };

  const formatCurrency = (value: any) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: value.currency || "USD",
    }).format(value.amount);
  };

  const handleNewSupplement = () => {
    requireAuth(() => setIsSupplementDialogOpen(true));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedContract) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Contrato no encontrado</h2>
        <p className="text-gray-500 mb-6">
          El contrato que estás buscando no existe o no tienes acceso a él.
        </p>
        <Button onClick={() => router.push("/contracts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Contratos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/contracts")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedContract.title}</h1>
            <div className="flex items-center mt-1 space-x-2">
              {getStatusBadge(selectedContract.status)}
              {getTypeBadge(selectedContract.type)}
              <span className="text-gray-500 text-sm">
                {selectedContract.contractNumber}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleNewSupplement}>
            <FileEdit className="h-4 w-4 mr-2" />
            Nuevo Suplemento
          </Button>
          {selectedContract.documents &&
            selectedContract.documents.length > 0 && (
              <Button variant="outline" asChild>
                <a
                  href={`/api/documents/${selectedContract.documents[0].id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Contrato
                </a>
              </Button>
            )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="parties">Partes</TabsTrigger>
          <TabsTrigger value="supplements">Suplementos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Descripción
                    </dt>
                    <dd className="mt-1">
                      {selectedContract.description || "Sin descripción"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Fecha de Firma
                      </dt>
                      <dd className="mt-1">
                        {formatDate(selectedContract.signDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Lugar de Firma
                      </dt>
                      <dd className="mt-1">
                        {selectedContract.signPlace || "No especificado"}
                      </dd>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Fecha de Inicio
                      </dt>
                      <dd className="mt-1">
                        {formatDate(selectedContract.startDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Fecha de Fin
                      </dt>
                      <dd className="mt-1">
                        {formatDate(selectedContract.endDate)}
                      </dd>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Valor Inicial
                      </dt>
                      <dd className="mt-1">
                        {formatCurrency(selectedContract.initialValue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Valor Actual
                      </dt>
                      <dd className="mt-1">
                        {formatCurrency(selectedContract.currentValue)}
                      </dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Condiciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Lugar de Entrega
                    </dt>
                    <dd className="mt-1">
                      {selectedContract.deliveryPlace || "No especificado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Plazo de Entrega
                    </dt>
                    <dd className="mt-1">
                      {selectedContract.deliveryTerm || "No especificado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Forma de Pago
                    </dt>
                    <dd className="mt-1">
                      {selectedContract.paymentMethod || "No especificado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Plazo de Pago
                    </dt>
                    <dd className="mt-1">
                      {selectedContract.paymentTerm || "No especificado"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Plazo de Garantía
                    </dt>
                    <dd className="mt-1">
                      {selectedContract.warrantyTerm || "No especificado"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parties" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Nombre/Razón Social
                    </dt>
                    <dd className="mt-1">{selectedContract.companyName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Dirección
                    </dt>
                    <dd className="mt-1">
                      {selectedContract.companyAddress || "No especificada"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Código REEUP
                      </dt>
                      <dd className="mt-1">
                        {selectedContract.codeREEUP || "No especificado"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">NIT</dt>
                      <dd className="mt-1">
                        {selectedContract.nit || "No especificado"}
                      </dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Datos Bancarios
                    </dt>
                    <dd className="mt-1">
                      {selectedContract.bankDetails || "No especificados"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Teléfonos de Contacto
                    </dt>
                    <dd className="mt-1">
                      {selectedContract.contactPhones || "No especificados"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Representantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Representante Legal de la Empresa
                    </h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs text-gray-500">Nombre</dt>
                        <dd>
                          {selectedContract.legalRepName || "No especificado"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Cargo</dt>
                        <dd>
                          {selectedContract.legalRepPosition ||
                            "No especificado"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">
                          Documento de Representación
                        </dt>
                        <dd>
                          {selectedContract.legalRepDocument ||
                            "No especificado"}
                        </dd>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <dt className="text-xs text-gray-500">Número</dt>
                          <dd>{selectedContract.legalRepNumber || "N/A"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">Fecha</dt>
                          <dd>
                            {selectedContract.legalRepDate
                              ? formatDate(selectedContract.legalRepDate)
                              : "N/A"}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Cliente/Contraparte
                    </h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs text-gray-500">
                          Nombre/Razón Social
                        </dt>
                        <dd>{selectedContract.clientName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Dirección</dt>
                        <dd>
                          {selectedContract.clientAddress || "No especificada"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Representante</dt>
                        <dd>
                          {selectedContract.clientRepName || "No especificado"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Cargo</dt>
                        <dd>
                          {selectedContract.clientRepPosition ||
                            "No especificado"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="supplements" className="mt-6">
          <SupplementList contractId={contractId} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentList contractId={contractId} />
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear nuevo suplemento */}
      <NewSupplementDialog
        isOpen={isSupplementDialogOpen}
        onClose={() => setIsSupplementDialogOpen(false)}
        contractId={contractId}
        onSuccess={() => {
          setIsSupplementDialogOpen(false);
          fetchContract(contractId);
          setActiveTab("supplements");
        }}
      />

      {/* Modal de autenticación */}
      <AuthModal />
    </div>
  );
}
