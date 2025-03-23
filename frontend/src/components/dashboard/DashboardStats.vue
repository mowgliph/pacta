<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Resumen Contratos -->
    <div class="card bg-primary/5 border-primary/20 hover:shadow-lg transition-shadow duration-300">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-sm font-medium text-text-secondary">Contratos Activos</h3>
          <p class="text-2xl font-semibold text-primary">{{ stats.activeContracts }}</p>
        </div>
        <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <i class="fas fa-file-signature text-primary"></i>
        </div>
      </div>
      <div class="flex items-center text-xs text-text-secondary">
        <span class="flex items-center" :class="stats.contractsTrend > 0 ? 'text-success' : 'text-error'">
          <i :class="`fas fa-arrow-${stats.contractsTrend > 0 ? 'up' : 'down'} mr-1`"></i>
          {{ Math.abs(stats.contractsTrend) }}%
        </span>
        <span class="ml-2">vs mes anterior</span>
      </div>
    </div>

    <!-- Resumen Vencimientos -->
    <div class="card bg-warning/5 border-warning/20 hover:shadow-lg transition-shadow duration-300">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-sm font-medium text-text-secondary">Vencimientos Próximos</h3>
          <p class="text-2xl font-semibold text-warning">{{ stats.upcomingDeadlines }}</p>
        </div>
        <div class="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
          <i class="fas fa-clock text-warning"></i>
        </div>
      </div>
      <div class="flex items-center text-xs text-text-secondary">
        <span>En los próximos 30 días</span>
      </div>
    </div>

    <!-- Resumen Renovaciones -->
    <div class="card bg-success/5 border-success/20 hover:shadow-lg transition-shadow duration-300">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-sm font-medium text-text-secondary">Renovaciones Pendientes</h3>
          <p class="text-2xl font-semibold text-success">{{ stats.pendingRenewals }}</p>
        </div>
        <div class="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
          <i class="fas fa-sync-alt text-success"></i>
        </div>
      </div>
      <div class="flex items-center text-xs text-text-secondary">
        <span class="flex items-center" :class="stats.renewalsTrend > 0 ? 'text-success' : 'text-error'">
          <i :class="`fas fa-arrow-${stats.renewalsTrend > 0 ? 'up' : 'down'} mr-1`"></i>
          {{ Math.abs(stats.renewalsTrend) }}%
        </span>
        <span class="ml-2">vs mes anterior</span>
      </div>
    </div>

    <!-- Resumen Pagos -->
    <div class="card bg-error/5 border-error/20 hover:shadow-lg transition-shadow duration-300">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-sm font-medium text-text-secondary">Alertas</h3>
          <p class="text-2xl font-semibold text-error">0</p>
        </div>
        <div class="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
          <i class="fas fa-exclamation-triangle text-error"></i>
        </div>
      </div>
      <div class="flex items-center text-xs text-text-secondary">
        <span>Sin alertas pendientes</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DashboardStats {
  activeContracts: number;
  upcomingDeadlines: number;
  pendingRenewals: number;
  contractsTrend: number;
  renewalsTrend: number;
}

defineProps<{
  stats: DashboardStats;
}>();
</script> 