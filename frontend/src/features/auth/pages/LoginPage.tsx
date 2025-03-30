// src/features/auth/pages/LoginPage.tsx
import React from 'react';
import { LoginForm } from '../components/LoginForm'; // Importa el componente del formulario
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Componentes de UI para el layout

export const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-2 pb-2">
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
        {/* Podríamos añadir un pie de tarjeta si es necesario */}
        {/* <CardFooter>
          <p className="text-center text-sm text-gray-600">
            ¿No tienes cuenta? <a href="/register">Regístrate</a>
          </p>
        </CardFooter> */}
      </Card>
    </div>
  );
}; 