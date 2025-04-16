import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Shield, Clock, LucideIcon, FileText, Megaphone, Mail, Bell, Users, Filter, FileCheck, LogIn } from 'lucide-react';
import { Button } from "@/renderer/components/ui/button";
import PublicStats from './public/PublicStats';
import { HoverElevation, HoverScale, HoverGlow, HoverBounce } from '@/renderer/components/ui/micro-interactions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/renderer/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, className }) => (
  <Card className={`border bg-card/50 backdrop-blur-sm ${className}`}>
    <CardContent className="p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <CardTitle className="text-lg font-semibold mb-2">{title}</CardTitle>
      <CardDescription className="text-sm">{description}</CardDescription>
    </CardContent>
  </Card>
);

const Public: React.FC = () => {
  const [, navigate] = useLocation();

  const handleAccess = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute -z-10 top-0 left-1/4 w-1/2 h-1/2 bg-lime-gradient blur-3xl opacity-20 rounded-full"></div>
        <div className="container mx-auto px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Gestión eficiente de contratos empresariales
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                PACTA es una plataforma integral diseñada para optimizar la gestión de contratos, reducir errores y mejorar la organización documental de tu empresa.
              </p>

              <HoverBounce>
                <Button 
                  size="lg" 
                  onClick={handleAccess}
                  className="mr-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Acceder ahora
                </Button>
              </HoverBounce>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full blur-3xl opacity-30"></div>
                <div className="relative bg-background/80 backdrop-blur-sm rounded-3xl p-6 border">
                  <div className="flex items-center justify-center">
                    <FileCheck className="h-32 w-32 text-primary/80" />
                    <div className="absolute">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24">
        <div className="container mx-auto px-8">
          <div className="mb-12">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">
              Funcionalidades
            </span>
            <h2 className="text-3xl font-bold mb-4">
              PACTA ofrece una solución integral para la gestión y control de contratos empresariales en un solo lugar.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={FileCheck}
              title="Gestión de Contratos"
              description="Visualización, filtrado y búsqueda avanzada de contratos por tipo (Cliente/Proveedor), estado y múltiples criterios."
            />
            <FeatureCard
              icon={FileText}
              title="Suplementos Contractuales"
              description="Sistema para modificación de contratos mediante suplementos, manteniendo el historial completo de cambios."
              className="bg-card-foreground/5"
            />
            <FeatureCard
              icon={Bell}
              title="Notificaciones y Alertas"
              description="Alertas automáticas sobre vencimientos, renovaciones y acciones pendientes para evitar incumplimientos."
              className="bg-card-foreground/5"
            />
            <FeatureCard
              icon={BarChart2}
              title="Dashboard Estadístico"
              description="Panel principal con resumen visual de estadísticas de contratos y acciones rápidas personalizables."
            />
            <FeatureCard
              icon={Users}
              title="Perfiles de Usuario"
              description="Gestión de usuarios con roles específicos (RA y Admin) con control granular de permisos por módulo."
            />
            <FeatureCard
              icon={Filter}
              title="Filtros Avanzados"
              description="Sistema completo de filtrado y búsqueda para localizar rápidamente cualquier contrato en la base de datos."
              className="bg-card-foreground/5"
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Optimiza tu gestión de contratos hoy mismo</h2>
                  <p className="text-muted-foreground mb-6">
                    Descubre cómo PACTA puede ayudarte a centralizar toda la documentación contractual, evitar vencimientos no detectados y reducir riesgos legales en tu empresa.
                  </p>
                  <Button onClick={handleAccess}>
                    Iniciar Sesión
                  </Button>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
                    <div className="relative h-32 w-32 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <ArrowRight className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-20">
        <div className="container mx-auto px-8">
          <div className="mb-12">
            <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">
              Beneficios reales
            </span>
            <h2 className="text-3xl font-bold mb-4">
              Descubre cómo PACTA ayuda a empresas reales a optimizar su gestión contractual
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card-foreground/5 border-0">
              <CardContent className="p-6">
                <p className="text-sm">Una empresa de servicios logísticos logró reducir en un 95% los incidentes por vencimientos no detectados gracias al sistema de alertas automáticas.</p>
              </CardContent>
            </Card>
            <Card className="bg-card-foreground/5 border-0">
              <CardContent className="p-6">
                <p className="text-sm">Un bufete de abogados optimizó su tiempo de gestión contractual en un 40%, mejorando la organización y centralización de toda la documentación.</p>
              </CardContent>
            </Card>
            <Card className="bg-card-foreground/5 border-0">
              <CardContent className="p-6">
                <p className="text-sm">Una empresa de manufactura mejoró su seguimiento contractual con proveedores, reduciendo en un 30% los riesgos legales derivados de contratos vencidos.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <HoverGlow>
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-8">
            <div className="mb-12">
              <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4">
                Vista previa
              </span>
              <h2 className="text-3xl font-bold mb-4">
                Descubre el potencial de nuestro dashboard estadístico
              </h2>
              <p className="text-lg text-muted-foreground">
                Una muestra de las estadísticas disponibles en la versión completa de PACTA.
              </p>
            </div>
            <HoverScale>
              <PublicStats />
            </HoverScale>
            <p className="text-sm text-muted-foreground mt-6 text-center">
              Los datos mostrados son de demostración. Accede a la versión completa para ver tus estadísticas reales.
            </p>
          </div>
        </section>
      </HoverGlow>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-8">
          <h2 className="text-2xl font-semibold mb-4">¿Listo para optimizar tu gestión contractual?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Accede ahora para reducir riesgos, optimizar tiempos y mejorar la organización de contratos en tu empresa.</p>
          <Button 
            size="lg" 
            onClick={handleAccess}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Comenzar Ahora
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Public;