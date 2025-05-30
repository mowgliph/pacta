import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HardDrive, AlertCircle, CheckCircle, Clock, Download, Upload } from 'lucide-react';

export function BackupSettings() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [maxBackups, setMaxBackups] = useState(30);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simular progreso de respaldo
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 10) + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    // Simular restauración
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRestoring(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  // Datos de respaldos simulados
  const backupHistory = [
    { id: 1, date: '2025-05-30 10:30', size: '45.2 MB', type: 'Completo' },
    { id: 2, date: '2025-05-29 10:30', size: '44.8 MB', type: 'Completo' },
    { id: 3, date: '2025-05-28 10:30', size: '44.5 MB', type: 'Completo' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Respaldo de Datos
          </CardTitle>
          <CardDescription>
            Realiza copias de seguridad de la base de datos y restaura desde una copia existente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>¡Operación exitosa!</AlertTitle>
              <AlertDescription>
                La operación se ha completado correctamente.
              </AlertDescription>
            </Alert>
          )}

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Importante</AlertTitle>
            <AlertDescription>
              Realiza copias de seguridad regularmente para evitar pérdida de datos.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleBackup} 
                disabled={isBackingUp}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isBackingUp ? 'Creando respaldo...' : 'Crear respaldo'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleRestore}
                disabled={isRestoring || isBackingUp}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isRestoring ? 'Restaurando...' : 'Restaurar desde archivo'}
              </Button>
            </div>

            {isBackingUp && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso del respaldo:</span>
                  <span>{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de respaldo automático</CardTitle>
          <CardDescription>
            Configura cómo y cuándo se realizan los respaldos automáticos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Respaldos automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Habilita para realizar respaldos automáticos según la programación establecida.
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>

          {autoBackup && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                >
                  <option value="hourly">Cada hora</option>
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="monthly">Mensualmente</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-backups">Máximo de respaldos a mantener</Label>
                <input
                  id="max-backups"
                  type="number"
                  min="1"
                  max="365"
                  value={maxBackups}
                  onChange={(e) => setMaxBackups(parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Los respaldos más antiguos se eliminarán automáticamente.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de respaldos</CardTitle>
          <CardDescription>
            Lista de respaldos disponibles para restaurar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backupHistory.length > 0 ? (
            <div className="border rounded-md">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b">
                <div className="col-span-5 font-medium">Fecha</div>
                <div className="col-span-3 font-medium">Tamaño</div>
                <div className="col-span-2 font-medium">Tipo</div>
                <div className="col-span-2"></div>
              </div>
              {backupHistory.map((backup) => (
                <div key={backup.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-b-0">
                  <div className="col-span-5 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {backup.date}
                  </div>
                  <div className="col-span-3">{backup.size}</div>
                  <div className="col-span-2">{backup.type}</div>
                  <div className="col-span-2 flex justify-end">
                    <Button variant="ghost" size="sm" className="h-8">
                      Restaurar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay respaldos disponibles.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
