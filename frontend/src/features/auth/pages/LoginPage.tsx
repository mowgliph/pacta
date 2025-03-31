// src/features/auth/pages/LoginPage.tsx
import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCheck, IconLock } from '@tabler/icons-react';

export const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Panel izquierdo - Branding (visible en pantallas md y mayores) */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center p-12 bg-primary/10 dark:bg-primary/5">
        <div className="space-y-6 max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-primary p-2 text-primary-foreground">
              <IconLock className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">PACTA</h1>
          </div>
          
          <h2 className="text-2xl font-medium">Plataforma de Automatización y Control de Contratos Empresariales</h2>
          
          <p className="text-muted-foreground">
            Sistema integral para gestionar, automatizar y controlar contratos en un entorno seguro y eficiente.
          </p>
          
          <div className="space-y-4 py-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/20">
                <IconCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Control Total</h3>
                <p className="text-sm text-muted-foreground">Gestione todos sus contratos en un solo lugar</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/20">
                <IconCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Seguimiento Automático</h3>
                <p className="text-sm text-muted-foreground">Alertas y notificaciones de vencimientos</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/20">
                <IconCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Análisis Avanzado</h3>
                <p className="text-sm text-muted-foreground">Estadísticas y reportes detallados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Panel derecho - Formulario de login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg border-none animate-in fade-in slide-in-from-bottom-5 duration-500">
          <CardHeader className="space-y-2 pb-4">
            {/* En móviles, mostrar un branding más simple */}
            <div className="flex justify-center mb-4 md:hidden">
              <div className="rounded-full bg-primary p-2 text-primary-foreground">
                <IconLock className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Introduce tus credenciales para acceder a PACTA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Al iniciar sesión, aceptas las políticas de privacidad y términos de uso.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};