import React from 'react';
import { useNavigate } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Shield, Clock } from 'lucide-react';
import { Button } from "@/renderer/components/ui/button";
import PublicStats from './public/PublicStats';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    className="bg-card p-6 rounded-xl shadow-sm"
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <Icon className="h-8 w-8 text-primary mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

const Public = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        className="max-w-6xl mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-center mb-16"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-4">PACTA</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Plataforma de Automatización y Control de Contratos Empresariales
          </p>
          <Button
            onClick={() => navigate('/auth')}
            className="group"
          >
            Acceder al Sistema
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
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
      <motion.section 
        className="py-16 bg-muted/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Estadísticas Globales</h2>
          <PublicStats />
        </div>
      </motion.section>
    </div>
  );
};

export default Public;