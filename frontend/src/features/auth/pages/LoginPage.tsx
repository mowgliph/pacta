// src/features/auth/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { iniciarSesion, redirigirPorRol } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (username: string, password: string, recordarme: boolean) => {
    try {
      setError(null);
      setCargando(true);
      
      // Intentar iniciar sesión
      const exito = await iniciarSesion(username, password, recordarme);
      
      if (exito) {
        // Usar la función de redirección basada en rol
        redirigirPorRol();
      } else {
        setError('Credenciales inválidas. Por favor, intente nuevamente.');
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      setError('Ocurrió un error durante el inicio de sesión. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">PACTA</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <LoginForm onSubmit={handleLogin} cargando={cargando} />
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <span>¿Olvidaste tu contraseña? </span>
            <Link 
              to="/auth/reset-password"
              className="underline underline-offset-4 hover:text-primary"
            >
              Restablecerla
            </Link>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="w-full"
          >
            <Link to="/dashboard/public">
              Acceder como invitado
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}