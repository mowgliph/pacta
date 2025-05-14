import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../../../../components/ui/alert";
import { FileDown, Eye, ArrowLeft, Copy, Trash2 } from "lucide-react";
import { useSupplements } from "../../../../lib/useSupplements";
import {
  useContextMenu,
  ContextMenuAction,
} from "../../../../components/ui/context-menu";

export default function SupplementsListPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contractId = params.id;
  const {
    supplements,
    isLoading,
    error,
    fetchSupplements,
    downloadSupplement,
  } = useSupplements(contractId || "");

  const { openContextMenu } = useContextMenu();

  useEffect(() => {
    fetchSupplements();
  }, [fetchSupplements]);

  const handleCopyField = (field: string) => {
    navigator.clipboard.writeText(field);
    // Puedes usar un toast/notify si lo deseas
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 text-[#757575]">
        Cargando suplementos...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 flex flex-col gap-8">
      <button
        className="flex items-center gap-2 text-[#018ABE] hover:underline text-sm w-fit mb-2"
        onClick={() => navigate(`/contracts/${contractId}`)}
        tabIndex={0}
        aria-label="Volver al contrato"
        onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
          if (e.key === "Enter") navigate(`/contracts/${contractId}`);
        }}
      >
        <ArrowLeft size={18} /> Volver al contrato
      </button>
      <Card>
        <CardHeader>
          <CardTitle>Suplementos del Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : supplements.length === 0 ? (
            <div className="text-[#757575]">
              No hay suplementos registrados para este contrato.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg">
                <thead>
                  <tr className="bg-[#D6E8EE] text-[#001B48]">
                    <th className="px-4 py-2 text-left font-medium">Fecha</th>
                    <th className="px-4 py-2 text-left font-medium">Campo</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Valor anterior
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Nuevo valor
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Descripción
                    </th>
                    <th className="px-4 py-2 text-left font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {supplements.map((s) => {
                    const actions = [
                      {
                        label: "Ver detalle",
                        icon: <Eye size={16} />,
                        onClick: () =>
                          navigate(
                            `/contracts/${contractId}/supplements/${s.id}`
                          ),
                      },
                      s.fileName
                        ? {
                            label: "Descargar",
                            icon: <FileDown size={16} />,
                            onClick: () => downloadSupplement(s.id),
                          }
                        : undefined,
                      {
                        label: "Copiar campo",
                        icon: <Copy size={16} />,
                        onClick: () => handleCopyField(s.field),
                      },
                    ].filter(Boolean) as ContextMenuAction[];
                    return (
                      <tr
                        key={s.id}
                        className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors cursor-pointer select-none"
                        tabIndex={0}
                        aria-label={`Suplemento: ${s.id}`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          openContextMenu(actions, e.clientX, e.clientY);
                        }}
                      >
                        <td className="px-4 py-2">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{s.field}</td>
                        <td className="px-4 py-2">{s.oldValue}</td>
                        <td className="px-4 py-2">{s.newValue}</td>
                        <td className="px-4 py-2">{s.description}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(
                                `/contracts/${contractId}/supplements/${s.id}`
                              )
                            }
                            tabIndex={0}
                            aria-label="Ver suplemento"
                          >
                            <Eye size={16} className="mr-1" /> Ver
                          </Button>
                          {s.fileName && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadSupplement(s.id)}
                              tabIndex={0}
                              aria-label="Descargar suplemento"
                            >
                              <FileDown size={16} className="mr-1" /> Descargar
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
