import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, LogIn } from 'lucide-react';

/**
 * Versión pública limitada de estadísticas
 */
export default function PublicStatisticsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dirigir al login cuando se requiera autenticación
  const handleLogin = () => {
    navigate('/auth/login');
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
          <Button 
            size="sm"
            onClick={handleLogin}
            className="flex items-center gap-1"
          >
            <LogIn className="h-4 w-4" />
            <span>Iniciar Sesión</span>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Visión general de estadísticas del sistema (vista pública).
        </p>
      </div>
      
      {/* Alerta de modo vista previa */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Visualización limitada</AlertTitle>
        <AlertDescription>
          Estás viendo una versión limitada de las estadísticas. Para ver estadísticas detalladas, inicia sesión.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 h-auto p-1">
          <TabsTrigger value="overview" className="py-2">General</TabsTrigger>
          <TabsTrigger value="contracts" className="py-2">Contratos</TabsTrigger>
          <TabsTrigger value="companies" className="py-2">Empresas</TabsTrigger>
        </TabsList>
        
        {/* Resumen general */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de contratos</CardTitle>
              <CardDescription>Estadísticas generales del sistema</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total de contratos</p>
                <p className="text-3xl font-bold">124</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Contratos activos</p>
                <p className="text-3xl font-bold">98</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Contratos vencidos</p>
                <p className="text-3xl font-bold">26</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Suplementos</p>
                <p className="text-3xl font-bold">37</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Análisis de contratos */}
        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de contratos</CardTitle>
              <CardDescription>Distribución por categorías</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-muted-foreground">Inicia sesión para ver más estadísticas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Estadísticas de empresas */}
        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Empresas</CardTitle>
              <CardDescription>Principales empresas involucradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-muted-foreground">Inicia sesión para ver más estadísticas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Botón de inicio de sesión */}
      <Card>
        <CardHeader>
          <CardTitle>Accede a todas las estadísticas</CardTitle>
          <CardDescription>
            Inicia sesión para ver estadísticas detalladas, informes personalizados y mucho más.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} className="flex items-center gap-2">
            Iniciar sesión <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 