import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Database, Key } from 'lucide-react';
import { EmailSection } from './email/email-section';
import { BackupSection } from './backup/backup-section';
import { LicenseSection } from './license/license-section';

export function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración del Sistema</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gestiona la configuración general de la aplicación
        </p>
      </div>

      <Tabs defaultValue="email" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email" className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Correo Electrónico
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center justify-center gap-2">
            <Database className="w-4 h-4" />
            Copias de Seguridad
          </TabsTrigger>
          <TabsTrigger value="license" className="flex items-center justify-center gap-2">
            <Key className="w-4 h-4" />
            Licencia
          </TabsTrigger>
        </TabsList>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <TabsContent value="email" className="m-0">
            <EmailSection />
          </TabsContent>

          <TabsContent value="backup" className="m-0">
            <BackupSection />
          </TabsContent>

          <TabsContent value="license" className="m-0">
            <LicenseSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
