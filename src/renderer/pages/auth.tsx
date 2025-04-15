import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthSchema } from '@/renderer/utils/validation/schemas';
import { toast } from '@/renderer/hooks/use-toast';
import { useLocation } from 'wouter';
import useStore from '@/renderer/store/useStore';
import { electronAPI } from '@/renderer/api/electronAPI';
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Skeleton } from '@/renderer/components/ui/skeleton';
import { HoverScale, HoverBounce, HoverBackground } from '@/renderer/components/ui/micro-interactions';

interface FormInputs {
  username: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
  message?: string;
}

const Auth: React.FC = () => {
  const [, navigate] = useLocation();
  const setUserAndToken = useStore((state) => state.setUserAndToken);
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormInputs>({
    resolver: zodResolver(AuthSchema)
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (data: FormInputs): Promise<void> => {
    setIsLoading(true);
    try {
      const result: LoginResponse = await electronAPI.auth.login({
        username: data.username,
        password: data.password
      });

      if (result && result.token && result.user) {
        setUserAndToken(result.user, result.token);
        toast({ title: 'Éxito', description: 'Inicio de sesión correcto.' });
        navigate('/dashboard', { replace: true });
      } else {
        const errorMessage = result?.message || 'Credenciales inválidas.';
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ 
        title: 'Error', 
        description: 'Ocurrió un error durante el inicio de sesión.', 
        variant: 'destructive' 
      });
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
            <h1 className="text-3xl font-bold" aria-level={1}>PACTA</h1>
          </HoverScale>
          <p className="mt-2 text-muted-foreground">Plataforma de Automatización y Control de Contratos Empresariales</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="mt-8 space-y-6" role="form" aria-label="Formulario de autenticación">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground">
                Nombre de Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  {...register("username")}
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="usuario123"
                  aria-required="true"
                  aria-describedby="username-error"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600" id="username-error" role="alert">
                  {errors.username.message}
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
                  {...register("password")}
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
                  {errors.password.message}
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
        </form>

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