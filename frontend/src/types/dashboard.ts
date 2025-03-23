export interface DashboardStats {
  activeContracts: number;
  upcomingDeadlines: number;
  pendingRenewals: number;
  contractsTrend: number;
  renewalsTrend: number;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  time: string;
  icon: string;
  color: string;
  type: 'contract' | 'license' | 'notification' | 'system';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }[];
}

export interface DashboardData {
  contractStats: {
    active: number;
    expiringSoon: number;
    total: number;
  };
  contractTrends: {
    renewalsPending: number;
    newContracts: number;
  };
  recentActivities: Activity[];
  chartData: ChartData;
} 