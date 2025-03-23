import { ref, computed } from 'vue';
import type { DashboardStats, DashboardData, Activity } from '@/types/dashboard';

export function useDashboard() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const dashboardData = ref<DashboardData | null>(null);
  const selectedTimeRange = ref(30);

  const stats = computed<DashboardStats>(() => ({
    activeContracts: dashboardData.value?.contractStats?.active ?? 0,
    upcomingDeadlines: dashboardData.value?.contractStats?.expiringSoon ?? 0,
    pendingRenewals: dashboardData.value?.contractTrends?.renewalsPending ?? 0,
    contractsTrend: calculateTrend(dashboardData.value?.contractStats?.active ?? 0),
    renewalsTrend: calculateTrend(dashboardData.value?.contractTrends?.renewalsPending ?? 0)
  }));

  const chartData = computed(() => {
    if (!dashboardData.value) return null;

    return {
      labels: generateDateLabels(),
      datasets: [
        {
          label: 'Contratos Activos',
          data: generateRandomData(),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Renovaciones',
          data: generateRandomData(),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }
      ]
    };
  });

  const recentActivities = computed<Activity[]>(() => 
    dashboardData.value?.recentActivities || []
  );

  async function fetchDashboardData() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/dashboard?days=${selectedTimeRange.value}`);
      if (!response.ok) throw new Error('Error al cargar los datos del dashboard');
      
      dashboardData.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error desconocido';
      console.error('Error en fetchDashboardData:', e);
    } finally {
      isLoading.value = false;
    }
  }

  function calculateTrend(currentValue: number): number {
    // Implementar cálculo real de tendencia
    return Math.random() > 0.5 ? 3.2 : -1.8;
  }

  function generateDateLabels(): string[] {
    const labels = [];
    const today = new Date();
    
    for (let i = selectedTimeRange.value - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
    }
    
    return labels;
  }

  function generateRandomData(): number[] {
    return Array.from({ length: selectedTimeRange.value }, () => 
      Math.floor(Math.random() * 50) + 10
    );
  }

  function updateTimeRange(days: number) {
    selectedTimeRange.value = days;
    fetchDashboardData();
  }

  return {
    isLoading,
    error,
    stats,
    chartData,
    recentActivities,
    dashboardData,
    fetchDashboardData,
    updateTimeRange
  };
} 