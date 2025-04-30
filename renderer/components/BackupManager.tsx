import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, RotateCcw, Save, Trash } from "lucide-react";
import { useBackup } from "@/hooks/useBackup";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const BackupManager: React.FC = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [description, setDescription] = useState("");
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [openCleanDialog, setOpenCleanDialog] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState(7);

  const {
    backups,
    loading,
    error,
    createBackup,
    restoreBackup,
    deleteBackup,
    cleanOldBackups,
  } = useBackup();

  const handleCreateBackup = async () => {
    await createBackup(description);
    setOpenCreateDialog(false);
    setDescription("");
  };

  const handleRestoreBackup = async () => {
    if (selectedBackup) {
      await restoreBackup(selectedBackup);
      setOpenRestoreDialog(false);
      setSelectedBackup(null);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    await deleteBackup(backupId);
  };

  const handleCleanOldBackups = async () => {
    await cleanOldBackups(daysToKeep);
    setOpenCleanDialog(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Backups</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end gap-2 mb-4">
          <Button onClick={() => setOpenCreateDialog(true)} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Crear Backup
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpenCleanDialog(true)}
            disabled={loading}
          >
            <Trash className="mr-2 h-4 w-4" />
            Limpiar Antiguos
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{backup.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    Creado: {new Date(backup.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tamaño: {formatFileSize(backup.fileSize)}
                  </p>
                  {backup.note && (
                    <p className="text-sm text-muted-foreground">
                      Nota: {backup.note}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedBackup(backup.id);
                      setOpenRestoreDialog(true);
                    }}
                    disabled={loading}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteBackup(backup.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Backup</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenCreateDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateBackup} disabled={loading}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openRestoreDialog} onOpenChange={setOpenRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurar Backup</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea restaurar el backup {selectedBackup}? Esta
              acción sobrescribirá los datos actuales.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenRestoreDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleRestoreBackup} disabled={loading}>
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openCleanDialog} onOpenChange={setOpenCleanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limpiar Backups Antiguos</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="number"
              placeholder="Días a mantener"
              value={daysToKeep}
              onChange={(e) => setDaysToKeep(Number(e.target.value))}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenCleanDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCleanOldBackups} disabled={loading}>
              Limpiar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
