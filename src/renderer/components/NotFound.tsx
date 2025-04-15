import React from 'react';
import { Link } from 'wouter';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/renderer/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/renderer/components/ui/card';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h1 className="text-2xl font-bold">404 - Página no encontrada</h1>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Lo sentimos, no pudimos encontrar la página que estás buscando. Por favor, verifica la URL o regresa al inicio.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;