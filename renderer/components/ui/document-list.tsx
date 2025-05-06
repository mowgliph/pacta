import React from "react";
import { FileText, Trash2, Eye } from "lucide-react";
import { Button } from "./button";
import { ContextMenu, ContextMenuAction } from "./context-menu";

interface DocumentListProps {
  documents: Array<{
    id: string;
    originalName?: string;
    filename: string;
    uploadedAt: string;
  }>;
  onDownload: (doc: any) => void;
  onDelete?: (doc: any) => void;
  onViewDetails?: (doc: any) => void;
  showDate?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDownload,
  onDelete,
  onViewDetails,
  showDate = true,
}) => {
  if (!documents || documents.length === 0) return null;
  const sortedDocuments = [...documents].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  return (
    <section className="mt-4">
      <h3 className="text-base font-semibold text-[#001B48] mb-2">
        Documentos adjuntos
      </h3>
      <ul className="flex flex-col gap-2">
        {sortedDocuments.map((doc) => {
          const actions: ContextMenuAction[] = [
            {
              label: "Descargar",
              icon: <FileText size={16} />,
              onClick: () => onDownload(doc),
            },
          ];
          if (onViewDetails) {
            actions.push({
              label: "Ver detalles",
              icon: <Eye size={16} />,
              onClick: () => onViewDetails(doc),
            });
          }
          if (onDelete) {
            actions.push({
              label: "Eliminar",
              icon: <Trash2 size={16} />,
              onClick: () => onDelete(doc),
            });
          }
          return (
            <ContextMenu key={doc.id} actions={actions}>
              <li
                className="flex items-center gap-3 bg-[#F5F5F5] rounded px-3 py-2 cursor-pointer select-none"
                tabIndex={0}
                aria-label={`Documento: ${doc.originalName || doc.filename}`}
              >
                <span
                  className="text-sm text-[#018ABE] font-medium truncate max-w-xs"
                  title={doc.originalName || doc.filename}
                >
                  {doc.originalName || doc.filename}
                </span>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onDownload(doc)}
                  tabIndex={0}
                  aria-label={`Descargar documento: ${
                    doc.originalName || doc.filename
                  }`}
                >
                  <FileText size={16} /> Descargar
                </Button>
                {onViewDetails && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onViewDetails(doc)}
                    tabIndex={0}
                    aria-label={`Ver detalles de: ${
                      doc.originalName || doc.filename
                    }`}
                  >
                    <Eye size={16} />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => onDelete(doc)}
                    tabIndex={0}
                    aria-label={`Eliminar documento: ${
                      doc.originalName || doc.filename
                    }`}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
                {showDate && (
                  <span className="text-xs text-[#757575] ml-auto">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                )}
              </li>
            </ContextMenu>
          );
        })}
      </ul>
    </section>
  );
};
