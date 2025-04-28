// renderer/pages/settings/index.tsx
import React, { useEffect, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useAuth } from "../../hooks/useAuth";
import { Heading } from "../../components/ui/heading";
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
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { Separator } from "../../components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Download,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

type BackupItem = {
  id: string;
  filename: string;
  timestamp: string;
  size: number;
  description?: string;
};

export default function Settings() {
  const auth = useRequireAuth();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [backupsList, setBackupsList] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backupDescription, setBackupDescription] = useState("");
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const isAdmin = user?.role?.name === "Admin";

  useEffect(() => {
    // Verificar tema actual
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);

    // Cargar lista de respaldos si es admin
    if (isAdmin) {
      loadBackups();
    }
  }, [isAdmin]);

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const backups = await window.Electron.backups.listar();
      setBackupsList(backups);
    } catch (error) {
      console.error("Error al cargar respaldos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los respaldos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Guardar preferencia en localStorage
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // TODO: Implementar lógica para guardar preferencia
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      await window.Electron.backups.crear(backupDescription);

      toast({
        title: "Respaldo creado",
        description: "El respaldo se ha creado exitosamente",
      });

      setBackupDescription("");
      await loadBackups();
    } catch (error) {
      console.error("Error al crear respaldo:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el respaldo",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      setIsRestoring(true);
      await window.Electron.backups.restaurar(selectedBackup.id);

      toast({
        title: "Respaldo restaurado",
        description:
          "La base de datos ha sido restaurada exitosamente. La aplicación se reiniciará.",
      });

      // Cerrar el diálogo
      setSelectedBackup(null);

      // Esperar un poco antes de reiniciar para que el usuario vea el mensaje
      setTimeout(() => {
        window.Electron.app.relaunch();
      }, 3000);
    } catch (error) {
      console.error("Error al restaurar respaldo:", error);
      toast({
        title: "Error",
        description: "No se pudo restaurar el respaldo",
        variant: "destructive",
      });
      setIsRestoring(false);
      setSelectedBackup(null);
    }
  };

  const handleDeleteBackup = async (id: string) => {
    try {
      await window.Electron.backups.eliminar(id);

      toast({
        title: "Respaldo eliminado",
        description: "El respaldo ha sido eliminado exitosamente",
      });

      await loadBackups();
    } catch (error) {
      console.error("Error al eliminar respaldo:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el respaldo",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (!auth.user) return null;

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Heading
          title="Configuración"
          description="Personaliza la aplicación y gestiona configuraciones globales"
        />

        <Tabs defaultValue="app" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="app">Aplicación</TabsTrigger>
            {isAdmin && <TabsTrigger value="backup">Respaldos</TabsTrigger>}
          </TabsList>

          <TabsContent value="app">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias Generales</CardTitle>
                <CardDescription>
                  Configura las opciones generales de la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme-toggle" className="text-base">
                      Tema Oscuro
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Cambiar entre tema claro y oscuro
                    </p>
                  </div>
                  <Switch
                    id="theme-toggle"
                    checked={isDarkMode}
                    onCheckedChange={toggleTheme}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications-toggle" className="text-base">
                      Notificaciones
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar notificaciones dentro de la aplicación
                    </p>
                  </div>
                  <Switch
                    id="notifications-toggle"
                    checked={notificationsEnabled}
                    onCheckedChange={toggleNotifications}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="alert-days" className="text-base mb-2 block">
                    Días de Alerta
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Número de días antes del vencimiento para mostrar alertas
                  </p>
                  <div className="flex items-center">
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                        <SelectItem value="90">90 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="backup">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Crear Respaldo</CardTitle>
                    <CardDescription>
                      Crea un respaldo manual de la base de datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="backup-description">
                          Descripción del Respaldo
                        </Label>
                        <Input
                          id="backup-description"
                          placeholder="Ej: Respaldo antes de actualización"
                          value={backupDescription}
                          onChange={(e) => setBackupDescription(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <Button
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        className="mt-2"
                      >
                        {isCreatingBackup ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Creando Respaldo...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Crear Respaldo
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Respaldos Disponibles
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadBackups}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Actualizar
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Gestiona los respaldos de la base de datos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                        <p className="mt-2">Cargando respaldos...</p>
                      </div>
                    ) : backupsList.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay respaldos disponibles
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha de Creación</TableHead>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Tamaño</TableHead>
                              <TableHead>Descripción</TableHead>
                              <TableHead className="text-right">
                                Acciones
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {backupsList.map((backup) => (
                              <TableRow key={backup.id}>
                                <TableCell>
                                  {formatDate(backup.timestamp)}
                                </TableCell>
                                <TableCell>{backup.filename}</TableCell>
                                <TableCell>
                                  {formatFileSize(backup.size)}
                                </TableCell>
                                <TableCell>
                                  {backup.description || "-"}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setSelectedBackup(backup)
                                        }
                                      >
                                        <Database className="h-4 w-4 mr-1" />
                                        Restaurar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle className="text-center">
                                          Confirmar Restauración
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="py-4">
                                        <Alert variant="destructive">
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertTitle>¡Atención!</AlertTitle>
                                          <AlertDescription>
                                            Esta acción sobrescribirá todos los
                                            datos actuales con los del respaldo.
                                            Este proceso no se puede deshacer.
                                          </AlertDescription>
                                        </Alert>

                                        <div className="mt-4 space-y-2">
                                          <p>
                                            <strong>Fecha de respaldo:</strong>{" "}
                                            {selectedBackup
                                              ? formatDate(
                                                  selectedBackup.timestamp
                                                )
                                              : "-"}
                                          </p>
                                          <p>
                                            <strong>Nombre del archivo:</strong>{" "}
                                            {selectedBackup?.filename || "-"}
                                          </p>
                                          <p>
                                            <strong>Descripción:</strong>{" "}
                                            {selectedBackup?.description ||
                                              "Sin descripción"}
                                          </p>
                                        </div>

                                        <p className="mt-4">
                                          La aplicación se reiniciará
                                          automáticamente al finalizar la
                                          restauración.
                                        </p>
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          variant="outline"
                                          onClick={() =>
                                            setSelectedBackup(null)
                                          }
                                          disabled={isRestoring}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          onClick={handleRestoreBackup}
                                          disabled={isRestoring}
                                          variant="destructive"
                                        >
                                          {isRestoring ? (
                                            <>
                                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                              Restaurando...
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle2 className="mr-2 h-4 w-4" />
                                              Confirmar Restauración
                                            </>
                                          )}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteBackup(backup.id)
                                    }
                                  >
                                    <span className="sr-only">Eliminar</span>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    <div className="mt-4">
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Respaldo Automático</AlertTitle>
                        <AlertDescription>
                          El sistema crea respaldos automáticos diarios y
                          mantiene los últimos 7 días.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
