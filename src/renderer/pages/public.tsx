import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Shield, Clock, LucideIcon, FileText } from 'lucide-react';
import { Button } from "@/renderer/components/ui/button";
import PublicStats from './public/PublicStats';
import { HoverElevation, HoverScale, HoverGlow, HoverBounce } from '@/renderer/components/ui/micro-interactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/renderer/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <HoverElevation>
    <motion.div
      className="bg-card p-6 rounded-lg border dark:border-gray-700"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      role="article"
      aria-label={title}
    >
      <Icon className="h-8 w-8 text-primary mb-4" aria-hidden="true" />
      <HoverScale>
        <h3 className="text-lg font-semibold mb-2" aria-level={3}>{title}</h3>
      </HoverScale>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  </HoverElevation>
);

const DemoContractItem: React.FC<{ name: string; type: string }> = ({ name, type }) => (
  <li className="flex items-center justify-between py-2 border-b border-muted/50 last:border-b-0">
    <div className="flex items-center space-x-2">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{name}</span>
    </div>
    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{type}</span>
  </li>
);

const Public: React.FC = () => {
  const [, navigate] = useLocation();

  const handleAccess = () => {
    navigate('/auth');
  };

  const demoContracts = [
    { id: 'demo1', name: 'Contrato Ejemplo Cliente Alfa', type: 'Cliente' },
    { id: 'demo2', name: 'Acuerdo Proveedor Beta', type: 'Proveedor' },
    { id: 'demo3', name: 'Servicio Gamma', type: 'Cliente' },
  ];

  return (
    <div role="main" aria-label="Página principal" className="min-h-screen bg-background text-foreground">
      <motion.section
        className="max-w-6xl mx-auto px-4 py-20 sm:py-24 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        role="banner"
        aria-label="Encabezado principal"
      >
        <HoverScale>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight" aria-level={1}>PACTA</h1>
        </HoverScale>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Plataforma Inteligente para la Automatización y Control de Contratos Empresariales.
        </p>
        <HoverBounce>
          <Button
            size="lg"
            onClick={handleAccess}
            className="group"
            aria-label="Acceder al sistema de gestión de contratos"
          >
            Acceder al Sistema
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Button>
        </HoverBounce>
      </motion.section>

      <motion.section
        className="max-w-6xl mx-auto px-4 pb-20 sm:pb-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.1 }}
        role="region"
        aria-label="Características principales"
      >
        <h2 className="text-3xl font-bold text-center mb-12" aria-level={2}>Funcionalidades Clave</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={BarChart2}
            title="Estadísticas Claras"
            description="Visualiza el estado de tus contratos con métricas actualizadas y fáciles de entender."
          />
          <FeatureCard
            icon={Shield}
            title="Gestión Segura"
            description="Control total sobre tus documentos contractuales con almacenamiento local seguro."
          />
          <FeatureCard
            icon={Clock}
            title="Alertas Inteligentes"
            description="Notificaciones proactivas para vencimientos, renovaciones y tareas pendientes."
          />
        </div>
      </motion.section>

      <motion.section
        className="max-w-4xl mx-auto px-4 pb-20 sm:pb-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView="visible"
        animate={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        role="region"
        aria-label="Contratos de Demostración"
      >
        <Card className="bg-card border dark:border-gray-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Explora un Ejemplo</CardTitle>
            <p className="text-muted-foreground text-center text-sm pt-1">
              Mira cómo se visualizan algunos contratos en PACTA.
            </p>
          </CardHeader>
          <CardContent>
            {demoContracts.length > 0 ? (
              <ul className="space-y-2">
                {demoContracts.map((contract) => (
                  <DemoContractItem key={contract.id} name={contract.name} type={contract.type} />
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">No hay contratos de demostración disponibles.</p>
            )}
            <div className="text-center mt-6">
              <Button variant="outline" size="sm" onClick={handleAccess}>
                Ver más en el sistema
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <HoverGlow>
        <motion.section
          className="py-20 sm:py-24 bg-muted/30 dark:bg-muted/10"
          initial={{ opacity: 0 }}
          whileInView="visible"
          animate={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          role="region"
          aria-label="Estadísticas globales de demostración"
        >
          <div className="max-w-6xl mx-auto px-4">
            <HoverScale>
              <h2 className="text-3xl font-bold mb-10 text-center" aria-level={2}>Estadísticas Globales (Demo)</h2>
            </HoverScale>
            <PublicStats />
          </div>
        </motion.section>
      </HoverGlow>

      <section className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">¿Listo para optimizar tu gestión contractual?</h2>
        <p className="text-muted-foreground mb-6">Regístrate o inicia sesión para acceder a todas las funcionalidades.</p>
        <Button size="lg" onClick={handleAccess}>
          Empezar Ahora
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>
    </div>
  );
};

export default Public;