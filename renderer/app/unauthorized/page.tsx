import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Acceso no autorizado
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          No tienes los permisos necesarios para acceder a esta página. 
          Por favor, contacta al administrador si crees que esto es un error.
        </p>
        <div className="mt-6">
          <Button
            onClick={() => navigate(-1)}
            className="bg-azul-medio hover:bg-azul-oscuro"
          >
            Volver atrás
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="ml-3"
          >
            Ir al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
