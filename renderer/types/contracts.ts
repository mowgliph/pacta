// Tipo base para los contratos
export interface BaseContract {
  id: string;
  number: string;
  contractNumber: string;
  company: string;
  companyName?: string;
  type: "Cliente" | "Proveedor";
  description: string;
  startDate: string;
  endDate: string;
  updatedAt: string;
  status: string;
  amount: number;
  attachment?: string | null;
}

// Tipo para contratos archivados
export type ArchivedContract = BaseContract;

// Tipo para contratos activos
export type Contract = BaseContract;

// Tipos para el dashboard
export interface RecentActivity {
  title: string;
  date: string;
  description: string;
  type?: "success" | "warning" | "error" | "info";
}

export interface DashboardStats {
  totals: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
    archived: number;
  };
  trends?: {
    total?: { value: number; label: string; positive: boolean };
    active?: { value: number; label: string; positive: boolean };
    expiring?: { value: number; label: string; positive: boolean };
    expired?: { value: number; label: string; positive: boolean };
  };
  distribution: {
    client: number;
    supplier: number;
  };
  recentActivity: RecentActivity[];
}

// Tipos para los hooks del dashboard
export interface UseDashboardStatsReturn {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Tipo para las estadísticas del dashboard
export interface ContractStats {
  totals: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
    archived: number;
  };
  lastMonth: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
  };
  distribution: {
    client: number;
    supplier: number;
  };
  recentActivity: RecentActivity[];
}
