"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { FileDown, ArrowLeft } from "lucide-react";
import { useNotification } from "@/lib/useNotification";
import { useFileDialog } from "@/lib/useFileDialog";
import { DocumentList } from "@/components/ui/document-list";
import { Dialog } from "@/components/ui/dialog";

interface Supplement {
  id: string;
  contractId: string;
  field: string;
  oldValue: string;
  newValue: string;
  description: string;
  createdAt: string;
  fileName?: string;
}

export default function SupplementDetailPage() {
  const params = useParams<{ id: string; supplementId: string }>();
  const router = useRouter();
  const contractId = params.id;
  const supplementId = params.supplementId;
  const [supplement, setSupplement] = useState<Supplement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();
  const { saveFile } = useFileDialog();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      // @ts-ignore
      window.Electron.supplements.getById(supplementId),
      // @ts-ignore
      window.Electron.documents.getBySupplement(supplementId),
    ])
      .then(([res, docsRes]: any[]) => {
        if (res.success && res.data) {
          setSupplement(res.data);
        } else {
          setError(res.error || "No se pudo obtener el suplemento.");
        }
        if (docsRes && docsRes.success) {
          setDocuments(docsRes.data || []);
        }
      })
      .catch((err: any) => setError(err?.message || "Error de conexión"))
      .finally(() => setLoading(false));
  }, [supplementId]);

  const handleDownload = async () => {
    if (!supplement) return;
    try {
      // @ts-ignore
      await window.Electron.supplements.download(supplement.id);
    } catch (err: any) {
      alert("No se pudo descargar el suplemento.");
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    if (!supplement) {
      notify({
        title: "Sin suplemento",
        body: "No se encontró el suplemento para descargar el documento.",
        variant: "warning",
      });
      return;
    }
    const fileResult = await saveFile({
      title: `Guardar documento: ${doc.originalName || doc.filename}`,
      defaultPath: doc.originalName || doc.filename || "documento.pdf",
      filters: [{ name: "Documentos", extensions: ["pdf", "doc", "docx"] }],
    });
    if (!fileResult || !fileResult.filePath) {
      notify({
        title: "Descarga cancelada",
        body: "No se seleccionó ninguna ruta para guardar.",
        variant: "warning",
      });
      return;
    }
    // @ts-ignore
    const res = await window.Electron.supplements.export(
      supplement.id,
      fileResult.filePath
    );
    if (res && res.path) {
      notify({
        title: "Documento descargado",
        body: "El documento fue guardado correctamente.",
        variant: "success",
      });
    } else {
      notify({
        title: "Error",
        body: "No se pudo descargar el documento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = (doc: any) => {
    setDeletingDoc(doc);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDocument = async () => {
    if (!deletingDoc) return;
    try {
      // @ts-ignore
      const res = await window.Electron.documents.delete(deletingDoc.id);
      if (res && res.success) {
        notify({
          title: "Documento eliminado",
          body: "El documento fue eliminado correctamente.",
          variant: "success",
        });
        window.location.reload();
      } else {
        notify({
          title: "Error",
          body: res?.error || "No se pudo eliminar el documento.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      notify({
        title: "Error",
        body: err?.message || "No se pudo eliminar el documento.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeletingDoc(null);
    }
  };

  const handleViewDocumentDetails = (doc: any) => {
    setSelectedDoc(doc);
    setShowDetails(true);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 flex flex-col gap-8">
      <button
        className="flex items-center gap-2 text-[#018ABE] hover:underline text-sm w-fit mb-2"
        onClick={() => router.push(`/contracts/${contractId}/supplements`)}
      >
        <ArrowLeft size={18} /> Volver a suplementos
      </button>
      <Card>
        <CardHeader>
          <CardTitle>Detalle del Suplemento</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-[#757575]">Cargando suplemento...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : supplement ? (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-[#757575]">
                  Fecha de creación:
                </span>
                <div className="font-medium">
                  {new Date(supplement.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-xs text-[#757575]">
                  Campo modificado:
                </span>
                <div className="font-medium">{supplement.field}</div>
              </div>
              <div>
                <span className="text-xs text-[#757575]">Valor anterior:</span>
                <div className="font-medium">{supplement.oldValue}</div>
              </div>
              <div>
                <span className="text-xs text-[#757575]">Nuevo valor:</span>
                <div className="font-medium">{supplement.newValue}</div>
              </div>
              <div>
                <span className="text-xs text-[#757575]">
                  Descripción / Motivo:
                </span>
                <div className="font-medium">{supplement.description}</div>
              </div>
              {supplement.fileName && (
                <div className="flex items-center gap-2 mt-2">
                  <Button size="sm" variant="default" onClick={handleDownload}>
                    <FileDown size={16} className="mr-1" /> Descargar documento
                  </Button>
                  <span className="text-xs text-[#757575]">
                    {supplement.fileName}
                  </span>
                </div>
              )}
            </div>
          ) : null}
          {documents.length > 0 && (
            <section className="mt-4">
              <h3 className="text-base font-semibold text-[#001B48] mb-2">
                Documentos adjuntos
              </h3>
              <DocumentList
                documents={documents}
                onDownload={handleDownloadDocument}
                onDelete={handleDeleteDocument}
                onViewDetails={handleViewDocumentDetails}
              />
            </section>
          )}
        </CardContent>
      </Card>
      {/* Modal de detalles */}
      {showDetails && selectedDoc && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
            <h4 className="text-lg font-semibold mb-2 text-[#001B48]">
              Detalles del documento
            </h4>
            <div className="text-sm text-[#333] flex flex-col gap-1">
              <span>
                <b>Nombre original:</b>{" "}
                {selectedDoc.originalName || selectedDoc.filename}
              </span>
              <span>
                <b>Tipo:</b> {selectedDoc.mimeType}
              </span>
              <span>
                <b>Tamaño:</b> {Math.round((selectedDoc.size || 0) / 1024)} KB
              </span>
              <span>
                <b>Subido el:</b>{" "}
                {new Date(selectedDoc.uploadedAt).toLocaleString()}
              </span>
              {selectedDoc.description && (
                <span>
                  <b>Descripción:</b> {selectedDoc.description}
                </span>
              )}
              {selectedDoc.tags && (
                <span>
                  <b>Tags:</b> {selectedDoc.tags}
                </span>
              )}
              {selectedDoc.uploadedByName && (
                <span>
                  <b>Subido por:</b> {selectedDoc.uploadedByName}
                </span>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Dialog>
      )}
      {/* Confirmación de eliminación */}
      {showDeleteConfirm && deletingDoc && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
            <h4 className="text-lg font-semibold mb-2 text-[#F44336]">
              ¿Eliminar documento?
            </h4>
            <p className="text-sm text-[#333] mb-4">
              Esta acción no se puede deshacer. ¿Deseas eliminar{" "}
              <b>{deletingDoc.originalName || deletingDoc.filename}</b>?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDeleteDocument}>
                Eliminar
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
