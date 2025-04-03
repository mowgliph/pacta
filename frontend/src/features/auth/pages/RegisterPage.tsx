import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Registro Restringido</CardTitle>
          <CardDescription>
            El registro de nuevas cuentas solo está disponible para administradores
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Solo los administradores pueden crear nuevas cuentas de usuario. 
              Por favor, contacte a un administrador si necesita una cuenta.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-center p-8">
            <UserPlus className="h-16 w-16 text-muted-foreground" />
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