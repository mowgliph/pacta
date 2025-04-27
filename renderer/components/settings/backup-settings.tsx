'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Download, FileArchive, RefreshCw, Trash, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
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
} from '../ui/alert-dialog';
import { formatFileSize } from '../../lib/utils';
import apiClient from '../../lib/api-client';
import { useAuth } from '../../hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Calendar, Clock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

// Tipos de datos para backups
interface Backup {
  id: string;
  fileName: string;
  size: number;
  createdAt: string;
  description?: string;
}

export function BackupSettings() {
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const isAdmin = user?.role?.name === 'admin';
  
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  
  // Obtener lista de backups
  useEffect(() => {
    loadBackups();
  }, []);
  
  // Función para cargar backups
  const loadBackups = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Backup[]>('/api/backups');
      setBackups(data);
    } catch (error) {
      console.error('Error cargando backups:', error);
      toast.error('Error al cargar los respaldos');
    } finally {
      setLoading(false);
    }
  };
  
  // Crear backup
  const createBackup = async () => {
    setCreating(true);
    try {
      const data = await apiClient.post<Backup>('/api/backups');
      toast.success('Respaldo creado correctamente');
      
      // Actualizar lista de backups
      setBackups(prevBackups => [data, ...prevBackups]);
    } catch (error) {
      console.error('Error creando backup:', error);
      toast.error('Error al crear el respaldo');
    } finally {
      setCreating(false);
    }
  };
  
  // Restaurar backup
  const restoreBackup = async (backupId: string) => {
    setRestoring(true);
    setSelectedBackupId(backupId);
    
    try {
      const data = await apiClient.post<{success: boolean}>(`/api/backups/${backupId}/restore`);
      
      if (data.success) {
        toast.success('Base de datos restaurada correctamente');
        // Aquí podrías actualizar el estado según sea necesario
        // Por ejemplo, recargar la aplicación para reflejar los cambios
      } else {
        toast.error('Error al restaurar la base de datos');
      }
    } catch (error) {
      console.error('Error restaurando backup:', error);
      toast.error('Error al restaurar el respaldo');
    } finally {
      setRestoring(false);
      setSelectedBackupId(null);
    }
  };
  
  // Eliminar backup
  const deleteBackup = async (backupId: string) => {
    try {
      const data = await apiClient.delete<{success: boolean}>(`/api/backups/${backupId}`);
      
      if (data.success) {
        toast.success('Respaldo eliminado correctamente');
        // Actualizar lista eliminando el backup
        setBackups(prevBackups => prevBackups.filter(backup => backup.id !== backupId));
      } else {
        toast.error('Error al eliminar el respaldo');
      }
    } catch (error) {
      console.error('Error eliminando backup:', error);
      toast.error('Error al eliminar el respaldo');
    }
  };
  
  // Iniciar restauración
  const handleRestore = (backupId: string) => {
    setSelectedBackupId(backupId);
    setRestoreDialogOpen(true);
  };
  
  // Confirmar restauración
  const confirmRestore = () => {
    if (selectedBackupId) {
      restoreBackup(selectedBackupId);
    }
  };
  
  if (!isAdmin) {
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
              <p className="text-muted-foreground">No hay respaldos disponibles</p>
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
                      {backup.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {backup.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(backup.createdAt), 'dd/MM/yyyy')}</span>
                        <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                        <span>{format(new Date(backup.createdAt), 'HH:mm')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatFileSize(backup.size)}</Badge>
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
                                  <RefreshCw className={`h-4 w-4 ${restoring && selectedBackupId === backup.id ? 'animate-spin' : ''}`} />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>Restaurar este respaldo</span>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción reemplazará todos los datos actuales con los del respaldo.
                                <br />
                                Los datos actuales se perderán permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => restoreBackup(backup.id)}>
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
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>Eliminar este respaldo</span>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente el respaldo seleccionado.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
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
      
      {/* Diálogo de restauración */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar backup?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción reemplazará todos los datos actuales con los del backup seleccionado.
              La aplicación se reiniciará después de la restauración.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRestore}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={restoreBackupMutation.isPending}
            >
              {restoreBackupMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                'Restaurar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}