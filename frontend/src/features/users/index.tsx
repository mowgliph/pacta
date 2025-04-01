import React from 'react';
import { UserProfile } from './components/UserProfile';
import { Switch } from '@/components/ui/switch';

export function UserPage() {
  return (
    <div className="flex flex-col space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Perfil de Usuario</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <UserProfile />
        
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold">Actividad Reciente</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="relative mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium">Contrato actualizado</p>
                  <p className="text-sm text-muted-foreground">Hace 30 minutos</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="relative mt-0.5 h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">Nuevo contrato creado</p>
                  <p className="text-sm text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="relative mt-0.5 h-2 w-2 rounded-full bg-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Documento adjuntado</p>
                  <p className="text-sm text-muted-foreground">Ayer a las 14:30</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="text-lg font-semibold">Preferencias</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notificaciones por email</p>
                  <p className="text-sm text-muted-foreground">Recibir alertas por email</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notificaciones de sistema</p>
                  <p className="text-sm text-muted-foreground">Mostrar alertas en el sistema</p>
                </div>
                <Switch checked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Tema oscuro</p>
                  <p className="text-sm text-muted-foreground">Activar tema oscuro</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Exportamos los componentes individuales también para reutilización
export { UserProfile } from './components/UserProfile'; 