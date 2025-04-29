export interface Contract {
  id: string;
  title: string;
  parties: string;
  status:
    | "draft"
    | "pending_approval"
    | "active"
    | "expired"
    | "terminated"
    | "archived";
  date: string;
  value?: string;
}

export interface ExpiringContract {
  id: string;
  title: string;
  expirationDate: string;
  daysUntilExpiration: number;
}

export interface Activity {
  id: string;
  type: "creation" | "modification" | "approval" | "expiration";
  title: string;
  description: string;
  date: string;
  user: {
    name: string;
    avatar?: string;
  };
}

export interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  recentActivity: number;
}

export interface ChartData {
  status: Array<{ name: string; value: number; color?: string }>;
  type: Array<{ name: string; value: number; color?: string }>;
}

export interface DashboardSummary {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  recentActivity: number;
}

export interface ContractByStatus {
  status: string;
  count: number;
}

export interface ContractByType {
  type: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  type: "creation" | "modification" | "approval" | "expiration";
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  metadata: {
    contractTitle: string;
  };
}

export interface RecentContract {
  id: string;
  title: string;
  parties: string;
  status:
    | "draft"
    | "pending_approval"
    | "active"
    | "expired"
    | "terminated"
    | "archived";
  date: string;
  value?: string;
}

export interface UpcomingExpiration {
  id: string;
  title: string;
  endDate: Date;
}

export interface ContractStatus {
  status: "Vigente" | "Próximo a Vencer" | "Vencido" | "Archivado";
  count: number;
}

export interface ContractType {
  type: "Cliente" | "Proveedor";
  count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: ChartData;
  recentContracts: Contract[];
  expiringSoon: ExpiringContract[];
  recentActivity: Activity[];
}
