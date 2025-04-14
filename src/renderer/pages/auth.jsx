import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@/renderer/utils/validation/schemas';
import { toast } from '@/renderer/hooks/use-toast';
import { useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { loginUser } from '@/renderer/api/electronAPI';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Label } from '@/renderer/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Skeleton } from '@/renderer/components/ui/skeleton';
import { motion } from 'framer-motion';
import { LoadingSpinner } from "@/renderer/components/ui/loading-spinner";
import { HoverElevation, HoverScale, HoverGlow, HoverBounce } from '@/renderer/components/ui/micro-interactions';

const Auth = () => {
  const [, navigate] = useLocation();
  const setUserAndToken = useStore((state) => state.setUserAndToken);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(AuthSchema)
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await loginUser(data.username, data.password);

      if (result && result.token) {
        setUserAndToken(result.user || null, result.token);
        toast({ title: 'Éxito', description: 'Inicio de sesión correcto.' });
        navigate('/dashboard', { replace: true });
      } else {
        const errorMessage = result?.message || 'Credenciales inválidas.';
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: 'Error', description: 'Ocurrió un error durante el inicio de sesión.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="main" aria-label="Página de autenticación">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center" role="banner" aria-label="Encabezado de autenticación">
          <HoverScale>
            <h1 className="text-3xl font-bold" aria-level="1">PACTA</h1>
          </HoverScale>
          <p className="mt-2 text-muted-foreground">Plataforma de Automatización y Control de Contratos Empresariales</p>
        </div>

        <div className="mt-8 space-y-6" role="form" aria-label="Formulario de autenticación">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="tu@email.com"
                  aria-required="true"
                  aria-describedby="email-error"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600" id="email-error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  aria-required="true"
                  aria-describedby="password-error"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600" id="password-error" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                aria-label="Recordar mi sesión"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                Recordar mi sesión
              </label>
            </div>

            <div className="text-sm">
              <HoverBackground>
                <a href="#" className="font-medium text-primary hover:text-primary/80" aria-label="¿Olvidaste tu contraseña?">
                  ¿Olvidaste tu contraseña?
                </a>
              </HoverBackground>
            </div>
          </div>

          <HoverBounce>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label="Iniciar sesión"
            >
              Iniciar Sesión
            </button>
          </HoverBounce>
        </div>

        <div className="mt-6 text-center" role="complementary" aria-label="Información adicional">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <HoverBackground>
              <a href="#" className="font-medium text-primary hover:text-primary/80" aria-label="Registrarse">
                Regístrate
              </a>
            </HoverBackground>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;