import React, { useEffect, useState } from 'react';
import settingsService, { SMTPConfig } from '@/renderer/services/settingsService';
import { Card, CardHeader, CardTitle, CardContent } from '@/renderer/components/ui/card';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';
import { Button } from '@/renderer/components/ui/button';
import { toast } from '@/renderer/hooks/use-toast';

const defaultConfig: SMTPConfig = {
  host: '',
  port: 465,
  secure: true,
  username: '',
  password: '',
  from: '',
  enabled: false,
};

const Settings: React.FC = () => {
  const [config, setConfig] = useState<SMTPConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getSMTPConfig()
      .then(cfg => setConfig(cfg || defaultConfig))
      .catch(() => toast({ title: 'Error', description: 'No se pudo cargar la configuración SMTP', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsService.updateSMTPConfig(config);
      toast({ title: 'Éxito', description: 'Configuración SMTP guardada correctamente' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo guardar la configuración', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await settingsService.testSMTPConnection(config);
      if (result.success) {
        toast({ title: 'Conexión exitosa', description: result.message });
      } else {
        toast({ title: 'Fallo de conexión', description: result.message, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo probar la conexión', variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="p-8">Cargando configuración...</div>;

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Servidor SMTP</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="host">Servidor SMTP</Label>
              <Input id="host" name="host" value={config.host} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Puerto</Label>
              <Input id="port" name="port" type="number" value={config.port} onChange={handleChange} required />
            </div>
            <div className="flex items-center space-x-2">
              <input id="secure" name="secure" type="checkbox" checked={config.secure} onChange={handleChange} />
              <Label htmlFor="secure">Conexión segura (SSL/TLS)</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" name="username" value={config.username} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" value={config.password} onChange={handleChange} required autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">Correo remitente</Label>
              <Input id="from" name="from" value={config.from} onChange={handleChange} required />
            </div>
            <div className="flex items-center space-x-2">
              <input id="enabled" name="enabled" type="checkbox" checked={config.enabled} onChange={handleChange} />
              <Label htmlFor="enabled">Habilitar envío de correos</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleTest} disabled={testing}>
                {testing ? 'Probando...' : 'Probar Conexión'}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
