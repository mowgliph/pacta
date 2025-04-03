/**
 * Tipos para el módulo de estadísticas
 */

// Importamos los tipos básicos del dashboard que necesitaremos
import { type SpecificStats, type UserMetrics } from '../../dashboard/types';

// Re-exportamos los tipos compartidos con el dashboard
export type { SpecificStats, UserMetrics };

/**
 * Tipo para elementos en los gráficos
 */
export type ChartDataItem = {
  name: string;
  value: number;
  color?: string;
}

/**
 * Tipo para los datos del gráfico de estadísticas
 */
export type StatisticsChartData = {
  items: ChartDataItem[];
  total: number;
  title: string;
  description?: string;
}

/**
 * Tipo para los datos de la tabla de estadísticas
 */
export type StatisticsTableItem = {
  id: string;
  name: string;
  value: number | string;
  percentage?: number;
  color?: string;
  status?: string;
}

/**
 * Tipo para las estadísticas de contratos por tipo
 */
export type ContractTypeStatistics = {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Tipo para las estadísticas de contratos por estado
 */
export type ContractStatusStatistics = {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Tipo para las estadísticas de actividad
 */
export type ActivityStatistics = {
  type: string;
  count: number;
  percentage: number;
  color: string;
  users?: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

/**
 * Tipo para las estadísticas de usuario
 */
export type UserStatistics = {
  role: string;
  count: number;
  percentage: number;
  color: string;
  active: number;
  inactive: number;
}

/**
 * Tipo para las estadísticas de la empresa
 */
export type CompanyStatistics = {
  name: string;
  count: number;
  percentage: number;
  type: string;
  contracts?: number;
}

/**
 * Tipo para las estadísticas de contratos expirados
 */
export type ExpiredContractStatistics = {
  month: string;
  count: number;
  byType: Record<string, number>;
}

/**
 * Tipo para las estadísticas de suplementos
 */
export type SupplementStatistics = {
  withSupplements: number;
  withoutSupplements: number;
  byMonth: {
    month: string;
    count: number;
  }[];
  byType: Record<string, number>;
}

/**
 * Tipo para las estadísticas de nuevos contratos
 */
export type NewContractStatistics = {
  byMonth: {
    month: string;
    count: number;
  }[];
  byType: Record<string, number>;
  trend: {
    year: number;
    month: string;
    count: number;
  }[];
} 