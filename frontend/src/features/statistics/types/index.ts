/**
 * Tipos para el módulo de estadísticas
 */

// Importamos los tipos básicos del dashboard que necesitaremos
import { SpecificStats, UserMetrics } from '../../dashboard/types';

// Re-exportamos los tipos compartidos con el dashboard
export type { SpecificStats, UserMetrics };

/**
 * Tipo para elementos en los gráficos
 */
export interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

/**
 * Tipo para los datos del gráfico de estadísticas
 */
export interface StatisticsChartData {
  items: ChartDataItem[];
  total: number;
  title: string;
  description?: string;
}

/**
 * Tipo para los datos de la tabla de estadísticas
 */
export interface StatisticsTableItem {
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
export interface ContractTypeStatistics {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Tipo para las estadísticas de contratos por estado
 */
export interface ContractStatusStatistics {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Tipo para las estadísticas de actividad
 */
export interface ActivityStatistics {
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
export interface UserStatistics {
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
export interface CompanyStatistics {
  name: string;
  count: number;
  percentage: number;
  type: string;
  contracts?: number;
}

/**
 * Tipo para las estadísticas de contratos expirados
 */
export interface ExpiredContractStatistics {
  month: string;
  count: number;
  byType: Record<string, number>;
}

/**
 * Tipo para las estadísticas de suplementos
 */
export interface SupplementStatistics {
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
export interface NewContractStatistics {
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