import { createFileRoute } from '@tanstack/react-router';
import { StatisticsPage } from '@/features/statistics';

// Ruta para el módulo de estadísticas y análisis
export const Route = createFileRoute('/_authenticated/statistics')({
  component: StatisticsPage,
}); 