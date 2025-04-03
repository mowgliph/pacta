import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Página para mostrar errores inesperados en la aplicación
 */
export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError() as any;
  
  const errorMessage = error?.message || 'Ha ocurrido un error inesperado.';
  const errorDetails = error?.stack ? error.stack.split('\n')[0] : null;
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  const handleGoHome = () => {
    navigate('/', { replace: true });
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
        
        <h1 className="text-3xl font-bold tracking-tight">
          Algo salió mal
        </h1>
        
        <div className="rounded-md bg-destructive/10 p-4 text-left">
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          {errorDetails && (
            <p className="mt-2 text-xs text-muted-foreground">
              {errorDetails}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Intentar nuevamente
          </Button>
          
          <Button variant="outline" onClick={handleGoHome} className="gap-2">
            <Home className="h-4 w-4" />
            Volver al inicio
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground pt-4">
          Si el problema persiste, por favor contacta con soporte.
        </p>
      </div>
    </div>
  );
} 