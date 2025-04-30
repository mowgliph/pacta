import { useEffect, useState } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileIcon, DownloadIcon, TrashIcon } from "@radix-ui/react-icons";
import { formatFileSize, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentListProps {
  contractId: string;
}

export const DocumentList = ({ contractId }: DocumentListProps) => {
  const { listDocuments, openDocument, isLoading } = useDocuments();
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    loadDocuments();
  }, [contractId]);

  const loadDocuments = async () => {
    const docs = await listDocuments(contractId);
    setDocuments(docs);
  };

  const handleOpenDocument = async (path: string) => {
    try {
      await openDocument(path);
    } catch (error) {
      toast.error("Error al abrir el documento");
    }
  };

  const handleDownloadDocument = async (path: string, name: string) => {
    try {
      const result = await openDocument(path);
      if (result) {
        // Crear un enlace temporal para descargar el archivo
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([result]));
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      toast.error("Error al descargar el documento");
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tamaño</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="flex items-center gap-2">
                <FileIcon className="h-4 w-4" />
                <span>{doc.name}</span>
              </TableCell>
              <TableCell>{formatFileSize(doc.size)}</TableCell>
              <TableCell>{formatDate(doc.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDocument(doc.path)}
                  >
                    <FileIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadDocument(doc.path, doc.name)}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {documents.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No hay documentos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
