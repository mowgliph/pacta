import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFileSize, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { BackpackIcon, DownloadIcon, TrashIcon } from "@radix-ui/react-icons";

export const BackupManager = () => {
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const result = await window.Electron.backups.listar();
      setBackups(result);
    } catch (error) {
      toast.error("Error al cargar los respaldos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      await window.Electron.backups.crear();
      toast.success("Respaldo creado exitosamente");
      await loadBackups();
    } catch (error) {
      toast.error("Error al crear el respaldo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    try {
      setIsLoading(true);
      await window.Electron.backups.restaurar(backupId);
      toast.success("Respaldo restaurado exitosamente");
    } catch (error) {
      toast.error("Error al restaurar el respaldo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      setIsLoading(true);
      await window.Electron.backups.eliminar(backupId);
      toast.success("Respaldo eliminado exitosamente");
      await loadBackups();
    } catch (error) {
      toast.error("Error al eliminar el respaldo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Respaldos</CardTitle>
          <CardDescription>
            Crea, restaura y gestiona respaldos de la base de datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleCreateBackup}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <BackpackIcon className="h-4 w-4" />
              Crear Respaldo
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>{backup.name}</TableCell>
                  <TableCell>{formatFileSize(backup.size)}</TableCell>
                  <TableCell>{formatDate(backup.createdAt)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        backup.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : backup.status === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {backup.status === "completed"
                        ? "Completado"
                        : backup.status === "failed"
                        ? "Fallido"
                        : "En progreso"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={backup.status !== "completed"}
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteBackup(backup.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {backups.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No hay respaldos disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
