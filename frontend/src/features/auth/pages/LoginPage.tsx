// src/features/auth/pages/LoginPage.tsx
import React from 'react';
import { LoginForm } from '../components/LoginForm'; // Importa el componente del formulario
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Componentes de UI para el layout

export const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Introduce tus credenciales para acceder a PACTA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
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