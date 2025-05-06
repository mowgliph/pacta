"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useContractDetail } from "@/lib/useContractDetail";
import { useParams } from "next/navigation";
import { FileText, PlusCircle, Archive, ArrowLeft } from "lucide-react";
import { useAuth } from "@/store/auth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNotification } from "@/lib/useNotification";
import { useFileDialog } from "@/lib/useFileDialog";
import { DocumentList } from "@/components/ui/document-list";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// @ts-ignore
// Asegurar tipado correcto para window.Electron
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: Window & typeof globalThis;

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Vigente"
      ? "bg-[#D6E8EE] text-[#018ABE]"
      : status === "Vencido"
      ? "bg-[#F44336]/10 text-[#F44336]"
      : status === "Próximo a Vencer"
      ? "bg-[#FF9800]/10 text-[#FF9800]"
      : "bg-[#F5F5F5] text-[#757575]";
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { contract, supplements, documents, loading, error } =
    useContractDetail(id);
  const router = useRouter();
  const { user } = useAuth();
  const { notify } = useNotification();
  const { saveFile } = useFileDialog();
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notificación de contrato próximo a vencer
  React.useEffect(() => {
    if (contract && contract.status === "Próximo a Vencer") {
      notify({
        title: "Contrato próximo a vencer",
        body: `El contrato ${contract.number} está cerca de su fecha de vencimiento.`,
        variant: "warning",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract?.id, contract?.status]);

  // Documento principal (el primero)
  const mainDocument = documents && documents.length > 0 ? documents[0] : null;

  // Documentos ordenados del más reciente al más antiguo
  const sortedDocuments =
    documents && documents.length > 0
      ? [...documents].sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
      : [];

  const handleArchive = async () => {
    if (!contract) return;
    try {
      // @ts-ignore
      await window.Electron.ipcRenderer.invoke(
        "contracts:archive",
        contract.id
      );
      // @ts-ignore
      await window.Electron.ipcRenderer.invoke("notifications:show", {
        title: "Contrato archivado",
        body: "El contrato fue archivado correctamente.",
      });
      router.push("/contracts");
    } catch (err) {
      // @ts-ignore
      await window.Electron.ipcRenderer.invoke("notifications:show", {
        title: "Error",
        body: "No se pudo archivar el contrato.",
      });
    }
  };

  const handleExport = async () => {
    if (!contract) return;
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const fileResult = await saveFile({
        title: "Guardar contrato como PDF",
        defaultPath: `Contrato_${contract.number}.pdf`,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      if (!fileResult || !fileResult.filePath) {
        notify({
          title: "Exportación cancelada",
          body: "No se seleccionó ninguna ruta para guardar.",
          variant: "warning",
        });
        return;
      }
      // @ts-ignore
      await window.Electron.contracts.export(contract.id, fileResult.filePath);
      notify({
        title: "Contrato exportado",
        body: "El contrato fue exportado como PDF.",
        variant: "success",
      });
    } catch (err) {
      notify({
        title: "Error",
        body: "No se pudo exportar el contrato.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    if (!contract) {
      notify({
        title: "Sin contrato",
        body: "No se encontró el contrato para descargar el documento.",
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
    const res = await window.Electron.contracts.export(
      contract.id,
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
        // Refresca la lista de documentos (puedes usar un refetch o reload)
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

  if (loading) {
    return <div className="text-[#757575]">Cargando contrato...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <button
        className="flex items-center gap-2 text-[#018ABE] hover:underline text-sm w-fit"
        onClick={() => router.push("/contracts")}
        tabIndex={0}
        aria-label="Volver a contratos"
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push("/contracts");
        }}
      >
        <ArrowLeft size={18} /> Volver a contratos
      </button>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error al cargar contrato</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : contract ? (
        <>
          {/* Información principal */}
          <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-6 justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-[#001B48] font-inter mb-1">
                  Contrato {contract.number}
                </h1>
                <div className="text-[#757575] text-sm mb-1">
                  {contract.company}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium">Tipo:</span> {contract.type}
                  <span className="font-medium ml-4">Estado:</span>{" "}
                  <StatusBadge status={contract.status} />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#018ABE] text-white hover:bg-[#02457A] text-sm font-medium shadow-sm"
                  onClick={() =>
                    router.push(`/contracts/${contract.id}/supplements/new`)
                  }
                  tabIndex={0}
                  aria-label="Agregar suplemento"
                >
                  <PlusCircle size={18} /> Agregar Suplemento
                </button>
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#757575] text-white hover:bg-[#333] text-sm font-medium shadow-sm"
                  onClick={handleArchive}
                  tabIndex={0}
                  aria-label="Archivar contrato"
                >
                  <Archive size={18} /> Archivar
                </button>
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#D6E8EE] text-[#018ABE] hover:bg-[#97CADB] text-sm font-medium shadow-sm"
                  onClick={handleExport}
                  tabIndex={0}
                  aria-label="Exportar contrato PDF"
                >
                  <FileText size={18} /> Exportar PDF
                </button>
                {mainDocument && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#018ABE] text-white hover:bg-[#02457A] text-sm font-medium shadow-sm"
                      onClick={() => handleDownloadDocument(mainDocument)}
                      tabIndex={0}
                      aria-label={`Descargar documento adjunto: ${
                        mainDocument.originalName || mainDocument.filename
                      }`}
                    >
                      <FileText size={18} /> Descargar documento
                    </button>
                    <span
                      className="text-xs text-[#018ABE] font-medium"
                      title={mainDocument.originalName || mainDocument.filename}
                    >
                      {mainDocument.originalName || mainDocument.filename}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xs text-[#757575] mb-1">
                  Fecha de inicio
                </div>
                <div className="font-medium">
                  {new Date(contract.startDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#757575] mb-1">Fecha de fin</div>
                <div className="font-medium">
                  {new Date(contract.endDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#757575] mb-1">Monto</div>
                <div className="font-medium">
                  {contract.amount.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#757575] mb-1">Descripción</div>
                <div className="font-medium">{contract.description}</div>
              </div>
            </div>
          </section>

          {/* Historial de suplementos */}
          <section className="bg-white rounded-xl shadow p-6 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-[#001B48] font-inter mb-4">
              Historial de suplementos
            </h2>
            {supplements.length === 0 ? (
              <div className="text-[#757575]">
                No hay suplementos registrados para este contrato.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
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
                    </tr>
                  </thead>
                  <tbody>
                    {supplements.map((s) => (
                      <tr
                        key={s.id}
                        className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors"
                      >
                        <td className="px-4 py-2">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{s.field}</td>
                        <td className="px-4 py-2">{s.oldValue}</td>
                        <td className="px-4 py-2">{s.newValue}</td>
                        <td className="px-4 py-2">{s.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Documentos adjuntos */}
          <DocumentList
            documents={documents}
            onDownload={handleDownloadDocument}
            onDelete={handleDeleteDocument}
            onViewDetails={handleViewDocumentDetails}
          />
        </>
      ) : null}

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

      {/* Animaciones gestionadas por TailwindCSS, no se requiere <style> */}
    </div>
  );
}
