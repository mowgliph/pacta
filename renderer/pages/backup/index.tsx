"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Spinner } from "../../components/ui/spinner";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Download, Save, Trash2, RotateCw, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useAuth } from "../../hooks/useAuth";
import { Backup } from "../../types/index";
import { getBackups } from "../../lib/api";

// Componente principal de la página de respaldos
// Este componente maneja la creación, restauración y eliminación de respaldos
// de la base de datos. También muestra una lista de los respaldos existentes
// y permite al usuario interactuar con ellos.
export default function BackupPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [backupDescription, setBackupDescription] = useState("");
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchBackups();
  }, []);

  // Función para cargar los respaldos desde la API
  // y actualizar el estado del componente.
  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const data = await getBackups();
      setBackups(data);
    } catch (error) {
      console.error("Error al cargar los respaldos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los respaldos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear un nuevo respaldo
  const createBackup = async () => {
    setIsCreating(true);
    try {
      await import("../../lib/api").then(async ({ createBackup }) => {
        await createBackup();
        toast({
          title: "Éxito",
          description: "El respaldo se ha creado correctamente",
        });
        setBackupDescription(""); // Limpiar el campo de descripción
        fetchBackups(); // Refrescar la lista de respaldos
      });
    } catch (error) {
      console.error("Error al crear respaldo:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el respaldo",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Función para restaurar un respaldo seleccionado
  const restoreBackup = async () => {
    if (!selectedBackup) return;

    setIsRestoring(true);
    try {
      // Importar la función de la API y restaurar el respaldo
      await import("../../lib/api").then(async ({ restoreBackup }) => {
        await restoreBackup(selectedBackup.id);

        toast({
          title: "Éxito",
          description:
            "El respaldo se ha restaurado correctamente. La aplicación se reiniciará.",
        });

        setIsRestoreDialogOpen(false);

        // Reiniciar la aplicación después de restaurar el respaldo
        // Usamos relaunch y exit según la documentación oficial de Electron
        setTimeout(() => {
          if (window.Electron && window.Electron.app) {
            // Verificamos que los métodos existan
            if (
              typeof window.Electron.app.relaunch === "function" &&
              typeof window.Electron.app.exit === "function"
            ) {
              window.Electron.app.relaunch();
              window.Electron.app.exit(0);
            } else {
              // Fallback si los métodos no están disponibles
              window.location.reload();
            }
          } else {
            // Fallback para desarrollo o si la API de Electron no está disponible
            window.location.reload();
          }
        }, 3000); // Dar tiempo para que el usuario vea el mensaje de éxito
      });
    } catch (error) {
      console.error("Error al restaurar respaldo:", error);
      toast({
        title: "Error",
        description: "No se pudo restaurar el respaldo",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Función para eliminar un respaldo seleccionado
  const deleteBackup = async () => {
    if (!selectedBackup) return;

    try {
      await import("../../lib/api").then(async ({ deleteBackup }) => {
        await deleteBackup(selectedBackup.id);
        toast({
          title: "Éxito",
          description: "El respaldo ha sido eliminado correctamente",
        });
        setIsDeleteDialogOpen(false);
        fetchBackups(); // Refrescar la lista de respaldos
      });
    } catch (error) {
      console.error("Error al eliminar respaldo:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el respaldo",
        variant: "destructive",
      });
    }
  };

  // Funciones auxiliares para formatear la fecha y el tamaño del archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy, HH:mm", {
      locale: es,
    });
  };

  // Verificar permisos
  if (!hasRole("Admin")) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <AlertTriangle className="mb-4 h-16 w-16 text-yellow-500" />
        <h1 className="text-2xl font-bold">Acceso Restringido</h1>
        <p className="mt-2 text-gray-600">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Respaldo y Restauración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Respaldos de la Base de Datos</CardTitle>
          <CardDescription>
            Gestiona los respaldos de la base de datos. Los respaldos
            automáticos se generan diariamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Label htmlFor="backupDescription">
                  Descripción del respaldo
                </Label>
                <Input
                  id="backupDescription"
                  placeholder="Ej: Antes de actualización"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                />
              </div>
              <Button
                className="self-end"
                onClick={createBackup}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Spinner className="mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear respaldo
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-md border">
              <div className="border-b bg-muted p-3">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium">
                  <div className="col-span-5">Descripción</div>
                  <div className="col-span-3">Fecha</div>
                  <div className="col-span-2">Tamaño</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Spinner />
                </div>
              ) : backups.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No hay respaldos disponibles</p>
                </div>
              ) : (
                <div className="divide-y">
                  {backups.map((backup) => (
                    <div key={backup.id} className="hover:bg-muted/50 p-3">
                      <div className="grid grid-cols-12 gap-2 items-center text-sm">
                        <div className="col-span-5 flex items-center">
                          {backup.isAutomatic ? (
                            <RotateCw className="mr-2 h-4 w-4 text-blue-500" />
                          ) : (
                            <Save className="mr-2 h-4 w-4 text-green-500" />
                          )}
                          <span className="truncate">{backup.description}</span>
                        </div>
                        <div className="col-span-3">
                          {formatDate(backup.createdAt)}
                        </div>
                        <div className="col-span-2">
                          {formatFileSize(backup.size)}
                        </div>
                        <div className="col-span-2 flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setIsRestoreDialogOpen(true);
                            }}
                            title="Restaurar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación de restauración */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar respaldo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas restaurar este respaldo? La aplicación
              se reiniciará y todos los datos actuales serán reemplazados.
            </DialogDescription>
          </DialogHeader>
          {selectedBackup && (
            <div className="py-2">
              <p className="text-sm font-medium">Detalles del respaldo:</p>
              <p className="text-sm">
                Descripción: {selectedBackup.description}
              </p>
              <p className="text-sm">
                Fecha: {formatDate(selectedBackup.createdAt)}
              </p>
              <p className="text-sm">
                Tamaño: {formatFileSize(selectedBackup.size)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRestoreDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={restoreBackup}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <Spinner className="mr-2" />
                  Restaurando...
                </>
              ) : (
                "Restaurar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar respaldo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este respaldo? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteBackup}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
