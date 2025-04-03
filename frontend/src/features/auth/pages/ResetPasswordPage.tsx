import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, KeyIcon } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Restablecimiento de Contraseña</CardTitle>
          <CardDescription>
            El restablecimiento de contraseñas está restringido
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              El restablecimiento de contraseñas solo puede ser realizado por un administrador.
              Por favor, contacte a un administrador si necesita restablecer su contraseña.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-center p-8">
            <KeyIcon className="h-16 w-16 text-muted-foreground" />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            className="w-full"
            asChild
          >
            <Link to="/auth/login">
              Volver a la página de inicio de sesión
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 