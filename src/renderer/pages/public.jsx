import React from 'react';
import { useNavigate } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Shield, Clock } from 'lucide-react';
import { Button } from "@/renderer/components/ui/button";
import PublicStats from './public/PublicStats';
import { HoverElevation, HoverScale, HoverGlow, HoverBounce } from '@/renderer/components/ui/micro-interactions';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <HoverElevation>
    <motion.div
      className="bg-card p-6 rounded-xl shadow-sm"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      role="article"
      aria-label={title}
    >
      <Icon className="h-8 w-8 text-primary mb-4" aria-hidden="true" />
      <HoverScale>
        <h3 className="text-lg font-semibold mb-2" aria-level="3">{title}</h3>
      </HoverScale>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  </HoverElevation>
);

const Public = () => {
  const navigate = useNavigate();

  return (
    <div role="main" aria-label="Página principal">
      <motion.div 
        className="max-w-6xl mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        role="banner"
        aria-label="Encabezado principal"
      >
        <motion.div 
          className="text-center mb-16"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <HoverScale>
            <h1 className="text-4xl font-bold mb-4" aria-level="1">PACTA</h1>
          </HoverScale>
          <p className="text-xl text-muted-foreground mb-8">
            Plataforma de Automatización y Control de Contratos Empresariales
          </p>
          <HoverBounce>
            <Button
              onClick={() => navigate('/auth')}
              className="group"
              aria-label="Acceder al sistema de gestión de contratos"
            >
              Acceder al Sistema
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
          </HoverBounce>
        </motion.div>

        <div 
          className="grid md:grid-cols-3 gap-8 mb-16"
          role="region"
          aria-label="Características principales"
        >
          <FeatureCard
            icon={BarChart2}
            title="Estadísticas en Tiempo Real"
            description="Visualiza el estado de tus contratos con métricas actualizadas"
          />
          <FeatureCard
            icon={Shield}
            title="Gestión Segura"
            description="Control total sobre tus documentos contractuales"
          />
          <FeatureCard
            icon={Clock}
            title="Alertas Automáticas"
            description="Notificaciones proactivas para vencimientos y renovaciones"
          />
        </div>
      </motion.div>
      <HoverGlow>
        <motion.section 
          className="py-16 bg-muted/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          role="region"
          aria-label="Estadísticas globales"
        >
          <div className="max-w-6xl mx-auto px-4">
            <HoverScale>
              <h2 className="text-2xl font-bold mb-8 text-center" aria-level="2">Estadísticas Globales</h2>
            </HoverScale>
            <PublicStats />
          </div>
        </motion.section>
      </HoverGlow>
    </div>
  );
};

export default Public;