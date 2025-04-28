"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Download,
  FileArchive,
  RefreshCw,
  Settings,
  Trash,
  Upload,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { formatFileSize } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Skeleton } from "../ui/skeleton";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import { backupApi } from "../../api/backup";
import { useToast } from "../../hooks/use-toast";
import { Backup } from "../../types";

// Enum para opciones de frecuencia de respaldo
enum BackupFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  CUSTOM = "custom",
}

// Interfaz para configuración de respaldo
interface BackupScheduleConfig {
  frequency: BackupFrequency;
  time: string; // HH:MM formato 24h
  dayOfWeek?: number; // 0-6 (domingo-sábado) para frecuencia semanal
  dayOfMonth?: number; // 1-31 para frecuencia mensual
  customExpression?: string; // Expresión cron personalizada
  retentionDays: number; // Días que se mantienen los respaldos automáticos
  enabled: boolean;
}

export function BackupSettings() {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user, hasRole } = useAuth();

  // Estados para gestión de respaldos
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Estado para la configuración de respaldos automáticos
  const [scheduleConfig, setScheduleConfig] = useState<BackupScheduleConfig>({
    frequency: BackupFrequency.DAILY,
    time: "00:00",
    retentionDays: 7,
    enabled: true,
  });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configTab, setConfigTab] = useState("backups");

  // Función para transformar configuración a expresión cron
  const generateCronExpression = (config: BackupScheduleConfig): string => {
    const [hour, minute] = config.time.split(":").map(Number);

    if (
      config.frequency === BackupFrequency.CUSTOM &&
      config.customExpression
    ) {
      return config.customExpression;
    }

    switch (config.frequency) {
      case BackupFrequency.DAILY:
        return `${minute} ${hour} * * *`;
      case BackupFrequency.WEEKLY:
        const dayOfWeek = config.dayOfWeek || 0;
        return `${minute} ${hour} * * ${dayOfWeek}`;
      case BackupFrequency.MONTHLY:
        const dayOfMonth = config.dayOfMonth || 1;
        return `${minute} ${hour} ${dayOfMonth} * *`;
      default:
        return "0 0 * * *"; // Valor predeterminado: diariamente a medianoche
    }
  };

  // Función para convertir expresión cron a configuración
  const parseCronExpression = (
    cronExp: string
  ): Partial<BackupScheduleConfig> => {
    try {
      // Expresión cron típica: minuto hora día-del-mes mes día-de-semana
      const parts = cronExp.trim().split(" ");

      if (parts.length !== 5) {
        throw new Error("Formato de expresión cron inválido");
      }

      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

      // Comprobar si es una expresión diaria (todos los días a una hora específica)
      if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
        return {
          frequency: BackupFrequency.DAILY,
          time: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
        };
      }

      // Comprobar si es una expresión semanal (un día específico de la semana)
      if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
        return {
          frequency: BackupFrequency.WEEKLY,
          time: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
          dayOfWeek: parseInt(dayOfWeek, 10),
        };
      }

      // Comprobar si es una expresión mensual (un día específico del mes)
      if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
        return {
          frequency: BackupFrequency.MONTHLY,
          time: `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`,
          dayOfMonth: parseInt(dayOfMonth, 10),
        };
      }

      // Si no coincide con ninguno de los patrones anteriores, considerarla personalizada
      return {
        frequency: BackupFrequency.CUSTOM,
        customExpression: cronExp,
      };
    } catch (error) {
      console.error("Error al analizar la expresión cron:", error);
      return {}; // Devolver objeto vacío en caso de error
    }
  };

  // Obtener lista de respaldos y configuración al cargar
  useEffect(() => {
    loadBackups();
    loadBackupConfig();
  }, []);

  // Función para cargar respaldos
  const loadBackups = async () => {
    setLoading(true);
    try {
      const response = await backupApi.getBackups();
      if (response.success && response.backups) {
        setBackups(response.backups);
      } else {
        throw new Error(response.error || "Error al cargar respaldos");
      }
    } catch (error) {
      console.error("Error cargando respaldos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los respaldos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar la configuración de respaldos
  const loadBackupConfig = async () => {
    setLoadingConfig(true);
    try {
      const response = await backupApi.getScheduleConfig();
      if (response.success && response.config) {
        const config = response.config;

        // Parsear la expresión cron a una configuración comprensible
        const parsedConfig = parseCronExpression(config.cronExpression);

        setScheduleConfig({
          ...scheduleConfig,
          ...parsedConfig,
          retentionDays: config.retentionDays || 7,
          enabled: config.enabled,
        });
      }
    } catch (error) {
      console.error("Error al cargar la configuración de respaldos:", error);
      toast({
        title: "Error",
        description:
          "No se pudo cargar la configuración de respaldos automáticos",
        variant: "destructive",
      });
    } finally {
      setLoadingConfig(false);
    }
  };

  // Función para guardar la configuración de respaldos
  const saveBackupConfig = async () => {
    setSavingConfig(true);
    try {
      const cronExpression = generateCronExpression(scheduleConfig);

      const response = await backupApi.updateScheduleConfig({
        cronExpression,
        retentionDays: scheduleConfig.retentionDays,
        enabled: scheduleConfig.enabled,
      });

      if (response.success) {
        toast({
          title: "Éxito",
          description: "Configuración de respaldos guardada correctamente",
        });
      } else {
        throw new Error(response.error || "Error al guardar la configuración");
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de respaldos",
        variant: "destructive",
      });
    } finally {
      setSavingConfig(false);
    }
  };

  // Crear respaldo manual
  const createBackup = async () => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "Usuario no identificado",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const description = "Respaldo manual";
      const response = await backupApi.createBackup(user.id, description);
      if (response.success) {
        toast({
          title: "Éxito",
          description: "El respaldo se ha creado correctamente",
        });
        loadBackups(); // Recargar la lista
      } else {
        throw new Error(response.error || "Error al crear respaldo");
      }
    } catch (error) {
      console.error("Error creando respaldo:", error);
      toast({
        title: "Error",
        description: "Error al crear el respaldo",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Restaurar respaldo
  const restoreBackup = async (backupId: string) => {
    if (!user || !user.id) return;

    setRestoring(true);
    setSelectedBackupId(backupId);

    try {
      const response = await backupApi.restoreBackup(backupId, user.id);

      if (response.success) {
        toast({
          title: "Éxito",
          description:
            "Base de datos restaurada correctamente. La aplicación se reiniciará.",
        });

        // Cerrar diálogo
        setRestoreDialogOpen(false);

        // Esperar 3 segundos antes de reiniciar
        setTimeout(() => {
          if (window.Electron && window.Electron.app) {
            if (
              typeof window.Electron.app.relaunch === "function" &&
              typeof window.Electron.app.exit === "function"
            ) {
              window.Electron.app.relaunch();
              window.Electron.app.exit(0);
            } else {
              window.location.reload();
            }
          } else {
            window.location.reload();
          }
        }, 3000);
      } else {
        throw new Error(response.error || "Error al restaurar respaldo");
      }
    } catch (error) {
      console.error("Error restaurando respaldo:", error);
      toast({
        title: "Error",
        description: "Error al restaurar el respaldo",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
      setSelectedBackupId(null);
    }
  };

  // Eliminar respaldo
  const deleteBackup = async (backupId: string) => {
    try {
      const response = await backupApi.deleteBackup(backupId);

      if (response.success) {
        toast({
          title: "Éxito",
          description: "Respaldo eliminado correctamente",
        });
        loadBackups(); // Recargar la lista
      } else {
        throw new Error(response.error || "Error al eliminar respaldo");
      }
    } catch (error) {
      console.error("Error eliminando respaldo:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el respaldo",
        variant: "destructive",
      });
    }
  };

  // Verificar permisos
  if (!hasRole("Admin")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Respaldos de Base de Datos</CardTitle>
          <CardDescription>
            Gestión de copias de seguridad del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={configTab} onValueChange={setConfigTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="backups">Respaldos</TabsTrigger>
          <TabsTrigger value="schedule">Programación</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Respaldos de la Base de Datos</CardTitle>
                <CardDescription>
                  Gestiona las copias de seguridad y restauración de datos
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={createBackup}
                disabled={creating}
                className="space-x-2"
              >
                {creating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Creando respaldo...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="h-4 w-4" />
                    <span>Crear respaldo</span>
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : backups.length === 0 ? (
                <div className="flex items-center justify-center h-32 border rounded">
                  <p className="text-muted-foreground">
                    No hay respaldos disponibles
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Archivo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tamaño</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">
                          {backup.fileName}
                          {backup.note && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {backup.note}
                            </p>
                          )}
                          {backup.isAutomatic && (
                            <Badge variant="outline" className="ml-2">
                              Auto
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(backup.createdAt), "dd/MM/yyyy")}
                            </span>
                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            <span>
                              {format(new Date(backup.createdAt), "HH:mm")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{backup.fileSize}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <TooltipProvider>
                            <AlertDialog>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={restoring}
                                    >
                                      <RefreshCw
                                        className={`h-4 w-4 ${
                                          restoring &&
                                          selectedBackupId === backup.id
                                            ? "animate-spin"
                                            : ""
                                        }`}
                                      />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>Restaurar este respaldo</span>
                                </TooltipContent>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ¿Está seguro?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción reemplazará todos los datos
                                    actuales con los del respaldo.
                                    <br />
                                    Los datos actuales se perderán
                                    permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => restoreBackup(backup.id)}
                                  >
                                    Restaurar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TooltipProvider>

                          <TooltipProvider>
                            <AlertDialog>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      disabled={!backup.canDelete}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {backup.canDelete ? (
                                    <span>Eliminar este respaldo</span>
                                  ) : (
                                    <span>
                                      No se pueden eliminar respaldos
                                      automáticos recientes
                                    </span>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ¿Está seguro?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente el
                                    respaldo seleccionado.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteBackup(backup.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Programación de Respaldos Automáticos</CardTitle>
              <CardDescription>
                Configure cuándo y con qué frecuencia se realizarán los
                respaldos automáticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingConfig ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-backups"
                      checked={scheduleConfig.enabled}
                      onCheckedChange={(checked) =>
                        setScheduleConfig({
                          ...scheduleConfig,
                          enabled: checked === true,
                        })
                      }
                    />
                    <Label htmlFor="enable-backups" className="font-medium">
                      Habilitar respaldos automáticos
                    </Label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="backup-frequency">Frecuencia</Label>
                      <Select
                        value={scheduleConfig.frequency}
                        onValueChange={(value) =>
                          setScheduleConfig({
                            ...scheduleConfig,
                            frequency: value as BackupFrequency,
                          })
                        }
                        disabled={!scheduleConfig.enabled}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione frecuencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BackupFrequency.DAILY}>
                            Diario
                          </SelectItem>
                          <SelectItem value={BackupFrequency.WEEKLY}>
                            Semanal
                          </SelectItem>
                          <SelectItem value={BackupFrequency.MONTHLY}>
                            Mensual
                          </SelectItem>
                          <SelectItem value={BackupFrequency.CUSTOM}>
                            Personalizado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {scheduleConfig.frequency === BackupFrequency.WEEKLY && (
                      <div>
                        <Label htmlFor="day-of-week">Día de la semana</Label>
                        <Select
                          value={String(scheduleConfig.dayOfWeek || 0)}
                          onValueChange={(value) =>
                            setScheduleConfig({
                              ...scheduleConfig,
                              dayOfWeek: parseInt(value, 10),
                            })
                          }
                          disabled={!scheduleConfig.enabled}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione día" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Domingo</SelectItem>
                            <SelectItem value="1">Lunes</SelectItem>
                            <SelectItem value="2">Martes</SelectItem>
                            <SelectItem value="3">Miércoles</SelectItem>
                            <SelectItem value="4">Jueves</SelectItem>
                            <SelectItem value="5">Viernes</SelectItem>
                            <SelectItem value="6">Sábado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {scheduleConfig.frequency === BackupFrequency.MONTHLY && (
                      <div>
                        <Label htmlFor="day-of-month">Día del mes</Label>
                        <Select
                          value={String(scheduleConfig.dayOfMonth || 1)}
                          onValueChange={(value) =>
                            setScheduleConfig({
                              ...scheduleConfig,
                              dayOfMonth: parseInt(value, 10),
                            })
                          }
                          disabled={!scheduleConfig.enabled}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione día" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(31)].map((_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)}>
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {scheduleConfig.frequency === BackupFrequency.CUSTOM && (
                      <div>
                        <Label htmlFor="custom-cron">
                          Expresión Cron personalizada
                        </Label>
                        <Input
                          id="custom-cron"
                          value={scheduleConfig.customExpression || ""}
                          onChange={(e) =>
                            setScheduleConfig({
                              ...scheduleConfig,
                              customExpression: e.target.value,
                            })
                          }
                          placeholder="*/5 * * * *"
                          disabled={!scheduleConfig.enabled}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Formato: minuto hora día-mes mes día-semana (ejemplo:
                          0 2 * * * = todos los días a las 2:00 AM)
                        </p>
                      </div>
                    )}

                    {scheduleConfig.frequency !== BackupFrequency.CUSTOM && (
                      <div>
                        <Label htmlFor="backup-time">Hora del día</Label>
                        <Input
                          id="backup-time"
                          type="time"
                          value={scheduleConfig.time}
                          onChange={(e) =>
                            setScheduleConfig({
                              ...scheduleConfig,
                              time: e.target.value,
                            })
                          }
                          disabled={!scheduleConfig.enabled}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="retention-days">Días de retención</Label>
                      <Input
                        id="retention-days"
                        type="number"
                        min="1"
                        max="90"
                        value={scheduleConfig.retentionDays}
                        onChange={(e) =>
                          setScheduleConfig({
                            ...scheduleConfig,
                            retentionDays: parseInt(e.target.value, 10) || 7,
                          })
                        }
                        disabled={!scheduleConfig.enabled}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Los respaldos automáticos más antiguos que este número
                        de días serán eliminados automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={saveBackupConfig}
                disabled={
                  savingConfig || loadingConfig || !scheduleConfig.enabled
                }
              >
                {savingConfig ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Guardar configuración
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de restauración */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar respaldo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción reemplazará todos los datos actuales con los del
              respaldo seleccionado. La aplicación se reiniciará después de la
              restauración.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedBackupId && restoreBackup(selectedBackupId)
              }
              className="bg-amber-600 hover:bg-amber-700"
              disabled={restoring}
            >
              {restoring ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                "Restaurar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
