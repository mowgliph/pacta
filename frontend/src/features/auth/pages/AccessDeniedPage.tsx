import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ChevronLeft } from 'lucide-react';

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md text-center space-y-6">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
        
        <h1 className="text-4xl font-bold tracking-tight">Acceso Denegado</h1>
        
        <p className="text-muted-foreground text-lg">
          No tienes permisos suficientes para acceder a esta página.
          Por favor, contacta con un administrador si crees que esto es un error.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Volver atrás
          </Button>
          
          <Button asChild className="gap-2">
            <Link to="/dashboard">
              <Home className="h-4 w-4" />
              Ir al Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 