import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

export function EmailSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    smtpServer: 'smtp.ejemplo.com',
    smtpPort: '587',
    smtpUser: 'usuario@ejemplo.com',
    smtpPassword: '',
    fromEmail: 'notificaciones@empresa.com',
    fromName: 'Sistema PACTA',
    useSSL: true,
    useTLS: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simular envío de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    // Implementar prueba de conexión SMTP
    alert('Probando conexión con el servidor SMTP...');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Configuración de Correo Electrónico
        </CardTitle>
        <CardDescription>
          Configura los parámetros del servidor SMTP para el envío de notificaciones por correo electrónico.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>¡Configuración guardada!</AlertTitle>
            <AlertDescription>
              Los cambios se han guardado correctamente.
            </AlertDescription>
          </Alert>
        )}

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Asegúrate de que el puerto SMTP esté abierto en tu servidor y que las credenciales sean correctas.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtpServer">Servidor SMTP</Label>
              <Input
                id="smtpServer"
                name="smtpServer"
                value={formData.smtpServer}
                onChange={handleChange}
                placeholder="smtp.ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPort">Puerto SMTP</Label>
              <Input
                id="smtpPort"
                name="smtpPort"
                type="number"
                value={formData.smtpPort}
                onChange={handleChange}
                placeholder="587"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUser">Usuario SMTP</Label>
              <Input
                id="smtpUser"
                name="smtpUser"
                type="email"
                value={formData.smtpUser}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPassword">Contraseña SMTP</Label>
              <Input
                id="smtpPassword"
                name="smtpPassword"
                type="password"
                value={formData.smtpPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromEmail">Correo del remitente</Label>
              <Input
                id="fromEmail"
                name="fromEmail"
                type="email"
                value={formData.fromEmail}
                onChange={handleChange}
                placeholder="notificaciones@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromName">Nombre del remitente</Label>
              <Input
                id="fromName"
                name="fromName"
                value={formData.fromName}
                onChange={handleChange}
                placeholder="Sistema PACTA"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="useSSL"
                name="useSSL"
                checked={formData.useSSL}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, useSSL: checked }))
                }
              />
              <Label htmlFor="useSSL">Usar SSL</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="useTLS"
                name="useTLS"
                checked={formData.useTLS}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, useTLS: checked }))
                }
              />
              <Label htmlFor="useTLS">Usar TLS/STARTTLS</Label>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar configuración'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isSaving}
            >
              Probar conexión
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
