import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Key, AlertCircle, CheckCircle, Info, Clock } from 'lucide-react';

export function LicenseSettings() {
  const [licenseKey, setLicenseKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Datos de la licencia simulados
  const [licenseInfo, setLicenseInfo] = useState({
    type: 'Premium',
    status: 'active',
    expiresAt: '2025-12-31',
    users: 10,
    company: 'Empresa Ejemplo S.A.',
    registeredTo: 'usuario@empresa.com',
  });

  const handleValidateLicense = async () => {
    if (!licenseKey.trim()) {
      setValidationError('Por favor ingresa una clave de licencia');
      return;
    }

    setIsValidating(true);
    setValidationError('');
    
    try {
      // Simular validación de licencia
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular respuesta exitosa
      setLicenseInfo({
        type: 'Enterprise',
        status: 'active',
        expiresAt: '2026-12-31',
        users: 25,
        company: 'Nueva Empresa S.A.',
        registeredTo: 'nuevo@empresa.com',
      });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setLicenseKey('');
    } catch (error) {
      setValidationError('Error al validar la licencia. Por favor verifica la clave e inténtalo de nuevo.');
    } finally {
      setIsValidating(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Información de la Licencia
          </CardTitle>
          <CardDescription>
            Gestiona la licencia de tu aplicación PACTA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>¡Licencia validada con éxito!</AlertTitle>
              <AlertDescription>
                Tu licencia ha sido activada correctamente.
              </AlertDescription>
            </Alert>
          )}

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Estado de la licencia</Label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  licenseInfo.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {licenseInfo.status === 'active' ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>

            <div>
              <Label>Tipo de licencia</Label>
              <p className="mt-1 text-sm">{licenseInfo.type}</p>
            </div>

            <div>
              <Label>Válida hasta</Label>
              <p className="mt-1 text-sm flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                {formatDate(licenseInfo.expiresAt)}
              </p>
            </div>

            <div>
              <Label>Usuarios permitidos</Label>
              <p className="mt-1 text-sm">{licenseInfo.users} usuarios</p>
            </div>

            <div className="md:col-span-2">
              <Label>Empresa</Label>
              <p className="mt-1 text-sm">{licenseInfo.company}</p>
            </div>

            <div className="md:col-span-2">
              <Label>Registrada a</Label>
              <p className="mt-1 text-sm">{licenseInfo.registeredTo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activar o actualizar licencia</CardTitle>
          <CardDescription>
            Ingresa tu clave de licencia para activar o actualizar tu suscripción.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>¿Necesitas una licencia?</AlertTitle>
              <AlertDescription>
                Contacta a nuestro equipo de ventas en{' '}
                <a href="mailto:ventas@pacta.app" className="text-primary hover:underline">
                  ventas@pacta.app
                </a>{' '}
                para obtener una licencia válida.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="license-key">Clave de licencia</Label>
              <div className="flex space-x-2">
                <Input
                  id="license-key"
                  type="text"
                  placeholder="Ingresa tu clave de licencia"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleValidateLicense}
                  disabled={isValidating}
                >
                  {isValidating ? 'Validando...' : 'Validar'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                La clave de licencia suele tener el formato: XXXXX-XXXXX-XXXXX-XXXXX
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de peligro</CardTitle>
          <CardDescription>
            Acciones que no se pueden deshacer. Ten cuidado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-1">
              <h4 className="font-medium">Desactivar licencia</h4>
              <p className="text-sm text-muted-foreground">
                Esto desactivará tu licencia actual en este dispositivo.
              </p>
            </div>
            <div>
              <Button variant="destructive" disabled={licenseInfo.status !== 'active'}>
                Desactivar licencia
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
