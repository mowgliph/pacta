import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSettings, BackupSettings, LicenseSettings } from '@/components/settings';
import { IconMail, IconDeviceFloppy, IconKey } from '@tabler/icons-react';

export default function SettingsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState('email');

  // Redirigir si no está autenticado
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Mostrar carga mientras se verifica la autenticación
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu cuenta y la aplicación
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
        defaultValue="email"
      >
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger 
            value="email" 
            className="flex items-center gap-2"
          >
            <IconMail className="h-4 w-4" />
            Correo
          </TabsTrigger>
          <TabsTrigger 
            value="backup" 
            className="flex items-center gap-2"
          >
            <IconDeviceFloppy className="h-4 w-4" />
            Respaldo
          </TabsTrigger>
          <TabsTrigger 
            value="license" 
            className="flex items-center gap-2"
          >
            <IconKey className="h-4 w-4" />
              Licencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-0">
          <EmailSettings />
        </TabsContent>

        <TabsContent value="backup" className="mt-0">
          <BackupSettings />
        </TabsContent>

        <TabsContent value="license" className="mt-0">
          <LicenseSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
