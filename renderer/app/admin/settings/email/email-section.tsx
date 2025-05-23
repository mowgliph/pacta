import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Save, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useEmailSettings } from '@/lib/useEmailSettings';
import { Loader2 } from 'lucide-react';
import { EmailSettings } from '@/types/electron';

export function EmailSection() {
  const { 
    settings, 
    isLoading, 
    isSaving, 
    saveSettings, 
    testConnection 
  } = useEmailSettings();
  
  const [formData, setFormData] = useState<Partial<EmailSettings>>({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    security: 'tls',
    isEnabled: false,
    lastTested: undefined,
    lastError: undefined
  });
  
  const [isTesting, setIsTesting] = useState(false);

  // Actualizar el formulario cuando se carguen los ajustes
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        ...settings
      }));
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      await saveSettings(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'smtpPort' ? value.toString() : value
    } as Partial<EmailSettings>));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await testConnection();
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Correo</CardTitle>
        <CardDescription>
          Configura los parámetros del servidor de correo para las notificaciones del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">Servidor SMTP</Label>
              <Input
                type="text"
                id="smtpHost"
                name="smtpHost"
                value={formData.smtpHost}
                onChange={handleChange}
                placeholder="smtp.ejemplo.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Puerto</Label>
              <Input
                type="number"
                id="smtpPort"
                name="smtpPort"
                value={formData.smtpPort}
                onChange={handleChange}
                placeholder="587"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Usuario</Label>
              <Input
                type="text"
                id="smtpUser"
                name="smtpUser"
                value={formData.smtpUser}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">Contraseña</Label>
              <Input
                type="password"
                id="smtpPassword"
                name="smtpPassword"
                value={formData.smtpPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">Correo de envío</Label>
              <Input
                type="email"
                id="fromEmail"
                name="fromEmail"
                value={formData.fromEmail}
                onChange={handleChange}
                placeholder="no-reply@ejemplo.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security">Seguridad</Label>
              <select
                id="security"
                name="security"
                value={formData.security}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isLoading}
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">Ninguna</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isLoading || isTesting || isSaving}
              className="flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Probando...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  Probar Conexión
                </>
              )}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
