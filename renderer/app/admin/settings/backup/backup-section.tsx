import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, FolderOpen, HardDriveDownload } from 'lucide-react';
import { useBackupSettings } from '@/lib/useBackupSettings';
import { useState } from 'react';
import { toast } from 'sonner';

export function BackupSection() {
  const {
    settings,
    loading,
    error,
    saveSettings,
    createBackup,
  } = useBackupSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await saveSettings({
        autoBackup: formData.get('autoBackup') === 'on',
        backupFrequency: formData.get('backupFrequency') as 'daily' | 'weekly' | 'monthly',
        maxBackups: Number(formData.get('maxBackups')),
        backupPath: formData.get('backupPath') as string,
      });
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const result = await createBackup();
      if (result?.success) {
        toast.success('Respaldo creado correctamente');
      }
    } catch (error) {
      toast.error('Error al crear el respaldo');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const selectBackupPath = async () => {
    try {
      const options = {
        title: 'Seleccionar carpeta para respaldos',
        defaultPath: settings.backupPath,
        properties: ['openDirectory', 'createDirectory']
      };
      
      const result = await window.electron.files.open(options);
      
      if (result && !result.canceled && result.filePaths[0]) {
        await saveSettings({ backupPath: result.filePaths[0] });
      }
    } catch (error) {
      console.error('Error al seleccionar ruta:', error);
      toast.error('Error al seleccionar la ruta de respaldo');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Respaldo de Datos</CardTitle>
        <CardDescription>
          Protege tu información con copias de seguridad automáticas y manuales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoBackup"
                name="autoBackup"
                defaultChecked={settings.autoBackup}
                className="h-4 w-4 rounded border-gray-300 text-azul-medio focus:ring-azul-medio"
              />
              <Label htmlFor="autoBackup">Realizar copias de seguridad automáticamente</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Frecuencia de respaldo</Label>
              <select
                id="backupFrequency"
                name="backupFrequency"
                defaultValue={settings.backupFrequency}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBackups">Máximo de copias de respaldo a mantener</Label>
              <Input
                id="maxBackups"
                name="maxBackups"
                type="number"
                min="1"
                defaultValue={settings.maxBackups}
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupPath">Ubicación de las copias de seguridad</Label>
              <div className="flex space-x-2">
                <Input
                  id="backupPath"
                  name="backupPath"
                  value={settings.backupPath}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={selectBackupPath}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Seleccionar
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
            >
              <HardDriveDownload className="h-4 w-4 mr-2" />
              {isCreatingBackup ? 'Creando respaldo...' : 'Crear Respaldo Ahora'}
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Database className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
