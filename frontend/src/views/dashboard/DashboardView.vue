<template>
  <div class="max-w-7xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-text-primary">Panel de Control</h1>
      <div class="flex items-center gap-4">
        <button 
          class="btn btn-outline-primary btn-sm"
          @click="refreshData"
          :disabled="isLoading"
        >
          <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': isLoading }"></i>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Estadísticas Principales -->
    <DashboardStats :stats="stats" />

    <!-- Acciones Rápidas -->
    <div class="card">
      <h2 class="text-lg font-medium text-text-primary mb-4">Acciones Rápidas</h2>
      <QuickActions />
    </div>

    <!-- Gráficos y Actividad Reciente -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Gráfico de Actividad -->
      <div class="lg:col-span-2">
        <ActivityChart 
          :data="chartData" 
          @range-change="updateTimeRange"
        />
      </div>

      <!-- Actividad Reciente -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-text-primary">Actividad Reciente</h2>
          <button class="text-xs text-primary hover:text-primary-600 transition-colors">
            Ver Todo
          </button>
        </div>
        <div class="space-y-4">
          <div 
            v-for="activity in dashboardData?.recentActivities" 
            :key="activity.id"
            class="flex items-start gap-3"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :style="{ backgroundColor: activity.color + '20', color: activity.color }"
            >
              <i :class="activity.icon"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-text-primary">{{ activity.title }}</p>
              <time 
                :datetime="activity.time"
                class="text-xs text-text-secondary"
              >
                {{ formatDate(activity.time) }}
              </time>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div 
      v-if="error"
      class="fixed bottom-4 right-4 bg-error/10 border border-error/20 text-error p-4 rounded-lg shadow-lg"
    >
      <div class="flex items-center gap-2">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DashboardStats from '@/components/dashboard/DashboardStats.vue';
import QuickActions from '@/components/dashboard/QuickActions.vue';
import ActivityChart from '@/components/dashboard/ActivityChart.vue';
import { useDashboard } from '@/composables/useDashboard';

const {
  isLoading,
  error,
  stats,
  chartData,
  dashboardData,
  fetchDashboardData,
  updateTimeRange
} = useDashboard();

function formatDate(date: string) {
  return format(new Date(date), 'PPp', { locale: es });
}

async function refreshData() {
  await fetchDashboardData();
}

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

.btn-outline-primary {
  @apply border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>