import React from "react";
import { FileText, Trash2, Eye } from "lucide-react";
import { Button } from "./button";
import { useContextMenu, ContextMenuAction } from "./context-menu";

interface Document {
  id: string;
  originalName?: string;
  filename: string;
  uploadedAt: string;
}

interface DocumentListProps {
  documents: Document[];
  onDownload: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  onViewDetails?: (doc: Document) => void;
  showDate?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDownload,
  onDelete,
  onViewDetails,
  showDate = true,
}) => {
  const { openContextMenu } = useContextMenu();

  if (!documents || documents.length === 0) return null;

  const sortedDocuments = [...documents].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return (
    <section className="mt-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b">
          <h3 className="text-sm font-medium text-foreground">
            Documentos adjuntos ({documents.length})
          </h3>
        </div>
        <ul className="divide-y divide-border">
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
              <li
                key={doc.id}
                className="group flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                tabIndex={0}
                aria-label={`Documento: ${doc.originalName || doc.filename}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openContextMenu(actions, e.clientX, e.clientY);
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p 
                      className="text-sm font-medium text-foreground truncate"
                      title={doc.originalName || doc.filename}
                    >
                      {doc.originalName || doc.filename}
                    </p>
                    {showDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(doc);
                    }}
                    tabIndex={0}
                    aria-label={`Descargar documento: ${doc.originalName || doc.filename}`}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  {onViewDetails && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(doc);
                      }}
                      tabIndex={0}
                      aria-label={`Ver detalles de: ${doc.originalName || doc.filename}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(doc);
                      }}
                      tabIndex={0}
                      aria-label={`Eliminar documento: ${doc.originalName || doc.filename}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {showDate && (
                    <span className="text-xs text-[#757575] ml-auto">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
