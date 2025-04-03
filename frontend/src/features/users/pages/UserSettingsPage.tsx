import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ChangePasswordForm } from '../components/ChangePasswordForm';

const UserSettingsPage = () => {
  const { toast } = useToast();
  const { usuario } = useAuth();
  const [isNotifyEmail, setIsNotifyEmail] = useState(true);
  const [isNotifySystem, setIsNotifySystem] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuración de la cuenta</h1>
        <p className="text-muted-foreground">Administre sus preferencias y seguridad</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          {(usuario?.role === 'ADMIN' || usuario?.role === 'RA') && (
            <TabsTrigger value="administracion">Administración</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre</label>
                  <Input value={usuario?.firstName || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Apellido</label>
                  <Input value={usuario?.lastName || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Correo electrónico</label>
                  <Input value={usuario?.email || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <Input value={usuario?.role || ''} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Tema oscuro</p>
                  <p className="text-sm text-muted-foreground">Activar tema oscuro para la interfaz</p>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm 
                onSuccess={() => {
                  toast({
                    title: "Operación exitosa",
                    description: "Tu contraseña ha sido actualizada correctamente",
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notificaciones por email</p>
                  <p className="text-sm text-muted-foreground">Recibir alertas por email</p>
                </div>
                <Switch checked={isNotifyEmail} onCheckedChange={setIsNotifyEmail} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notificaciones del sistema</p>
                  <p className="text-sm text-muted-foreground">Mostrar alertas en el sistema</p>
                </div>
                <Switch checked={isNotifySystem} onCheckedChange={setIsNotifySystem} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(usuario?.role === 'ADMIN' || usuario?.role === 'RA') && (
          <TabsContent value="administracion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Administración de usuarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Como usuario con privilegios administrativos, puede acceder a las opciones de gestión de usuarios.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button variant="outline" onClick={() => window.location.href = '/users'}>
                    Gestionar usuarios
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/users/new'}>
                    Registrar nuevo usuario
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opciones avanzadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={() => window.location.href = '/admin/logs'}>
                  Ver registros de actividad
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserSettingsPage; 