import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, RefreshCw, HardDriveDownload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLicense } from '@/lib/useLicense';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function LicenseSection() {
  const { licenseStatus, error, isLoading, validateLicense, getLicenseStatus } = useLicense();
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseContent, setLicenseContent] = useState('');

  useEffect(() => {
    getLicenseStatus();
  }, [getLicenseStatus]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.lic')) {
      alert('Por favor, seleccione un archivo con extensión .lic');
      return;
    }

    try {
      const content = await file.text();
      setLicenseContent(content);
      setLicenseFile(file);
    } catch (err) {
      console.error('Error al leer el archivo:', err);
      alert('Error al leer el archivo de licencia');
    }
  };

  const handleActivateLicense = async () => {
    if (!licenseContent) {
      alert('Por favor, seleccione un archivo de licencia');
      return;
    }

    try {
      const result = await validateLicense(licenseContent);
      if (result) {
        alert('Licencia activada correctamente');
      }
    } catch (err) {
      console.error('Error al validar la licencia:', err);
      alert('Error al validar la licencia');
    }
  };

  useEffect(() => {
    getLicenseStatus();
  }, [getLicenseStatus]);

  if (!licenseStatus) {
    return <div className="flex items-center justify-center h-32">Cargando...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }



  const handleRenewLicense = async () => {
    if (!licenseStatus?.licenseNumber) {
      alert('No hay licencia activa para renovar');
      return;
    }

    try {
      const result = await window.electron.license.revokeLicense(licenseStatus.licenseNumber);
      if (result.success) {
        await getLicenseStatus();
      }
    } catch (err) {
      console.error('Error al renovar licencia:', err);
    }
  };

  const handleExportInfo = async () => {
    if (!licenseStatus?.licenseNumber) {
      alert('No hay licencia activa para exportar');
      return;
    }

    try {
      const info = await window.electron.license.getLicenseInfo(licenseStatus.licenseNumber);
      if (info.success) {
        // Aquí implementar la lógica de exportación
        console.log('Información de licencia exportada:', info.data);
      }
    } catch (err) {
      console.error('Error al exportar información:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Licencia</CardTitle>
        <CardDescription>
          Gestiona la licencia de tu copia de PACTA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sección de validación de licencia */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="license-file">Archivo de licencia (.lic)</Label>
              <Input
                id="license-file"
                type="file"
                accept=".lic"
                onChange={handleFileChange}
              />
              {licenseFile && (
                <p className="mt-2 text-sm text-gray-500">
                  Archivo seleccionado: {licenseFile.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleActivateLicense}
              disabled={isLoading || !licenseContent}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Activando...</span>
                </div>
              ) : (
                'Activar Licencia'
              )}
            </Button>

          {/* Alertas de error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Estado de la licencia */}
          {licenseStatus?.valid ? (
            <div className="bg-green-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Key className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Licencia Válida</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Tipo: {licenseStatus.type || 'No especificado'}</p>
                    <p>Válida hasta: {licenseStatus.expiryDate || 'Sin fecha de expiración'}</p>
                    <p>Características: {licenseStatus.features?.join(', ') || 'No especificadas'}</p>
                  </div>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Fecha de Activación</dt>
                  <dd className="mt-1 text-sm text-gray-900">{licenseStatus.expiryDate || 'Sin fecha de expiración'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm text-gray-900">{licenseStatus.valid ? 'Válida' : 'No válida'}</dd>
                </div>
                {licenseStatus.features && licenseStatus.features.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Características</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <ul className="list-disc list-inside">
                        {licenseStatus.features.map((feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Sin Licencia Válida</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Por favor, ingrese una clave de licencia válida</p>
                  </div>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm text-gray-900">No válida</dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleRenewLicense}
          disabled={!licenseStatus?.licenseNumber}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Renovar Licencia
        </Button>
        <Button
          type="button"
          className="bg-azul-medio hover:bg-azul-oscuro"
          onClick={handleExportInfo}
        >
          <HardDriveDownload className="mr-2 h-4 w-4" />
          Exportar Información
        </Button>
      </CardFooter>
    </Card>
  );
}
