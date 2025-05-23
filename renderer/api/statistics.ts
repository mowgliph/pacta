import { ApiResponse, PaginationResponse } from './common';

export interface RecentActivity {
  id: string;
  type: 'new' | 'updated' | 'expired';
  date: string;
  description: string;
  name: string;
}

export interface StatisticsDashboard {
  totals: {
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

export interface StatisticsContracts {
  total: number;
  active: number;
  expiring: number;
  expired: number;
}

export interface StatisticsByCurrency {
  currency: string;
  count: number;
}

export interface StatisticsByUser {
  user: string;
  count: number;
}

export interface StatisticsByMonth {
  month: string;
  count: number;
}

export interface StatisticsSupplements {
  contractId: string;
  count: number;
}

export interface StatisticsUsersActivity {
  user: string;
  lastActivity: string;
  actions: number;
}

export interface StatisticsApi {
  dashboard: () => Promise<ApiResponse<StatisticsDashboard>>;
  contracts: (filters?: any) => Promise<ApiResponse<StatisticsContracts>>;
  byCurrency: () => Promise<ApiResponse<StatisticsByCurrency[]>>;
  byUser: () => Promise<ApiResponse<StatisticsByUser[]>>;
  byMonth: () => Promise<ApiResponse<StatisticsByMonth[]>>;
  supplements: () => Promise<ApiResponse<StatisticsSupplements[]>>;
  userActivity: () => Promise<ApiResponse<StatisticsUsersActivity[]>>;
}
