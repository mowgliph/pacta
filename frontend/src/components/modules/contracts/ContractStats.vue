<template>
  <div class="bg-surface rounded-lg shadow-sm p-6 mb-8">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-medium text-text-primary m-0">Estadísticas de Contratos</h3>
      <button 
        @click="loadStats" 
        class="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary cursor-pointer transition-all hover:bg-primary/20"
        :class="{ 'animate-spin': loading }"
      >
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-surface border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start shadow-sm">
        <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 flex-shrink-0">
          <i class="fas fa-file-contract"></i>
        </div>
        <div class="flex-1">
          <div class="text-2xl font-semibold text-text-primary leading-tight">{{ statistics.stats?.totalContracts || 0 }}</div>
          <div class="text-xs text-text-secondary">Total Contratos</div>
        </div>
      </div>
      
      <div class="bg-surface border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start shadow-sm">
        <div class="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center mr-4 flex-shrink-0">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="flex-1">
          <div class="text-2xl font-semibold text-text-primary leading-tight">{{ statistics.stats?.activeContracts || 0 }}</div>
          <div class="text-xs text-text-secondary">Activos</div>
        </div>
      </div>
      
      <div class="bg-surface border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start shadow-sm">
        <div class="w-10 h-10 rounded-full bg-warning/10 text-warning flex items-center justify-center mr-4 flex-shrink-0">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="flex-1">
          <div class="text-2xl font-semibold text-text-primary leading-tight">{{ statistics.stats?.expiringContracts || 0 }}</div>
          <div class="text-xs text-text-secondary">Próximos a vencer</div>
        </div>
      </div>
      
      <div class="bg-surface border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start shadow-sm">
        <div class="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center mr-4 flex-shrink-0">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="flex-1">
          <div class="text-2xl font-semibold text-text-primary leading-tight">{{ statistics.stats?.expiredContracts || 0 }}</div>
          <div class="text-xs text-text-secondary">Vencidos</div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-medium text-text-primary m-0">Distribución por Estado</h4>
        </div>
        <div class="p-5">
          <div v-if="statistics.statusCounts" class="h-[200px] relative">
            <canvas ref="statusChartRef"></canvas>
          </div>
          <div v-else class="h-[200px] flex flex-col items-center justify-center text-text-secondary">
            <i class="fas fa-chart-pie text-3xl mb-2 opacity-50"></i>
            <span class="text-sm">No hay datos suficientes</span>
          </div>
        </div>
      </div>
      
      <div class="bg-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 class="text-base font-medium text-text-primary m-0">Totales por Moneda</h4>
        </div>
        <div class="p-5">
          <div v-if="statistics.stats?.totalByCurrency && hasCurrencyData" class="flex flex-col gap-3">
            <div v-for="(value, currency) in statistics.stats.totalByCurrency" :key="currency" class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div class="font-medium text-text-primary">{{ currency }}</div>
              <div class="font-semibold text-primary">{{ new Intl.NumberFormat('es-ES', { style: 'currency', currency: String(currency), minimumFractionDigits: 2 }).format(Number(value)) }}</div>
            </div>
          </div>
          <div v-else class="h-[200px] flex flex-col items-center justify-center text-text-secondary">
            <i class="fas fa-money-bill-wave text-3xl mb-2 opacity-50"></i>
            <span class="text-sm">No hay datos suficientes</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="statistics.recentContracts && statistics.recentContracts.length > 0" class="bg-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 class="text-base font-medium text-text-primary m-0">Contratos Recientes</h4>
      </div>
      <div class="p-5">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="contract in statistics.recentContracts" :key="contract.id" class="bg-gray-50 dark:bg-gray-800 rounded p-3 border-l-4" :class="getBorderColorClass(contract.status)">
            <div class="font-medium text-text-primary mb-2">{{ contract.title }}</div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-text-secondary">{{ contract.contractNumber }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="getStatusBadgeClass(contract.status)">
                {{ getStatusLabel(contract.status) }}
              </span>
            </div>
            <div class="text-xs text-text-secondary">
              Actualizado: {{ formatDate(contract.updatedAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useContractStore } from '@/stores/contract';
import Chart from 'chart.js/auto';

const contractStore = useContractStore();
const statusChartRef = ref<HTMLCanvasElement | null>(null);
const statusChart = ref<Chart | null>(null);
const statistics = ref<any>({});
const loading = ref(false);

// Colores para el gráfico de estados
const statusColors = {
  draft: '#6B7280', // Gris
  active: '#10B981', // Verde
  expired: '#EF4444', // Rojo
  terminated: '#9333EA', // Morado
  renewed: '#3B82F6' // Azul
};

// Verificar si hay datos de moneda
const hasCurrencyData = computed(() => {
  if (!statistics.value.stats?.totalByCurrency) return false;
  return Object.keys(statistics.value.stats.totalByCurrency).length > 0;
});

onMounted(async () => {
  await loadStats();
});

async function loadStats() {
  loading.value = true;
  try {
    statistics.value = await contractStore.getContractStats();
    initStatusChart();
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  } finally {
    loading.value = false;
  }
}

function initStatusChart() {
  if (!statistics.value.statusCounts) return;
  if (!statusChartRef.value) return;

  // Destruir el gráfico anterior si existe
  if (statusChart.value) {
    statusChart.value.destroy();
  }

  const labels: string[] = [];
  const data: number[] = [];
  const colors: string[] = [];

  // Preparar datos para el gráfico
  for (const [status, count] of Object.entries(statistics.value.statusCounts)) {
    if ((count as number) > 0) {
      labels.push(getStatusLabel(status));
      data.push(count as number);
      colors.push(statusColors[status as keyof typeof statusColors] || '#CBD5E0');
    }
  }

  // Crear el gráfico
  statusChart.value = new Chart(statusChartRef.value, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        }
      }
    }
  });
}

function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    'draft': 'Borrador',
    'active': 'Activo',
    'expired': 'Vencido',
    'terminated': 'Terminado',
    'renewed': 'Renovado'
  };
  return statusMap[status] || status;
}

function getStatusBadgeClass(status: string) {
  const classMap: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    'active': 'bg-success/10 text-success',
    'expired': 'bg-error/10 text-error',
    'terminated': 'bg-warning/10 text-warning',
    'renewed': 'bg-info/10 text-info'
  };
  return classMap[status] || 'bg-gray-100 text-gray-600';
}

function getBorderColorClass(status: string) {
  const classMap: Record<string, string> = {
    'draft': 'border-gray-400',
    'active': 'border-success',
    'expired': 'border-error',
    'terminated': 'border-warning',
    'renewed': 'border-info'
  };
  return classMap[status] || 'border-gray-400';
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
</script>

<style scoped>
/* Este componente utiliza clases de Tailwind directamente en el template */
</style> 