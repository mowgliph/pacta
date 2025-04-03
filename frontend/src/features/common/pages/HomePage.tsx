import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

/**
 * Página principal de la aplicación
 */
export default function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center text-center space-y-4 mb-16">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          PACTA
        </h1>
        <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
          Sistema de Gestión de Contratos y Suplementos
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button size="lg" asChild>
            <Link to="/auth/login">Iniciar sesión</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/dashboard/public">Ver como invitado</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Contratos</CardTitle>
            <CardDescription>
              Administra todos los contratos en un solo lugar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Mantén un registro completo de todos los contratos, fechas importantes, 
              partes involucradas y condiciones específicas.
            </p>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/contracts/public">
                Ver contratos públicos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Seguimiento de Suplementos</CardTitle>
            <CardDescription>
              Mantén el control de modificaciones y adendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Gestiona fácilmente todos los suplementos asociados a cada contrato,
              manteniendo un historial completo de cambios y modificaciones.
            </p>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/dashboard/public">
                Ver dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas y Reportes</CardTitle>
            <CardDescription>
              Obtén información valiosa de tus contratos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Analiza tendencias, fechas de vencimiento, montos y más con nuestras
              herramientas de estadísticas y generación de reportes personalizados.
            </p>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/statistics/public">
                Ver estadísticas <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 