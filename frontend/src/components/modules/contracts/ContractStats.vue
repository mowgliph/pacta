<template>
  <div class="contract-stats">
    <div class="stats-header">
      <h3>Estadísticas de Contratos</h3>
      <div class="refresh-button" @click="loadStats" :class="{ 'is-loading': loading }">
        <i class="fas fa-sync-alt"></i>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon active">
          <i class="fas fa-file-contract"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.stats?.totalContracts || 0 }}</div>
          <div class="stat-label">Total Contratos</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon active">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.stats?.activeContracts || 0 }}</div>
          <div class="stat-label">Activos</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.stats?.expiringContracts || 0 }}</div>
          <div class="stat-label">Próximos a vencer</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon danger">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.stats?.expiredContracts || 0 }}</div>
          <div class="stat-label">Vencidos</div>
        </div>
      </div>
    </div>
    
    <div class="stats-row">
      <div class="status-distribution">
        <h4>Distribución por Estado</h4>
        <div v-if="statistics.statusCounts" class="status-chart">
          <canvas ref="statusChartRef"></canvas>
        </div>
        <div v-else class="chart-placeholder">
          <i class="fas fa-chart-pie"></i>
          <span>No hay datos suficientes</span>
        </div>
      </div>
      
      <div class="currency-totals">
        <h4>Totales por Moneda</h4>
        <div v-if="statistics.stats?.totalByCurrency && hasCurrencyData" class="currency-list">
          <div v-for="(value, currency) in statistics.stats.totalByCurrency" :key="currency" class="currency-item">
            <div class="currency-name">{{ currency }}</div>
            <div class="currency-value">{{ new Intl.NumberFormat('es-ES', { style: 'currency', currency: String(currency), minimumFractionDigits: 2 }).format(Number(value)) }}</div>
          </div>
        </div>
        <div v-else class="currency-placeholder">
          <i class="fas fa-money-bill-wave"></i>
          <span>No hay datos suficientes</span>
        </div>
      </div>
    </div>
    
    <div v-if="statistics.recentContracts && statistics.recentContracts.length > 0" class="recent-contracts">
      <h4>Contratos Recientes</h4>
      <div class="recent-list">
        <div v-for="contract in statistics.recentContracts" :key="contract.id" class="recent-item">
          <div class="recent-title">{{ contract.title }}</div>
          <div class="recent-details">
            <span class="recent-number">{{ contract.contractNumber }}</span>
            <span :class="['recent-status', `status-${contract.status}`]">
              {{ getStatusLabel(contract.status) }}
            </span>
          </div>
          <div class="recent-date">
            Actualizado: {{ formatDate(contract.updatedAt) }}
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

<style lang="scss" scoped>
.contract-stats {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }
  
  .refresh-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--bg-primary);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: var(--bg-hover);
    }
    
    &.is-loading i {
      animation: spin 1s linear infinite;
    }
    
    i {
      color: var(--primary-color);
      font-size: 0.875rem;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background-color: var(--bg-primary);
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.active {
      background-color: var(--primary-light);
      color: var(--primary-color);
    }
    
    &.warning {
      background-color: var(--warning-light);
      color: var(--warning-color);
    }
    
    &.danger {
      background-color: var(--danger-light);
      color: var(--danger-color);
    }
    
    i {
      font-size: 1rem;
    }
  }
  
  .stat-info {
    display: flex;
    flex-direction: column;
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.2;
      color: var(--text-primary);
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.status-distribution, .currency-totals {
  background-color: var(--bg-primary);
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: var(--text-primary);
  }
}

.status-chart {
  height: 200px;
  position: relative;
}

.chart-placeholder, .currency-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }
  
  span {
    font-size: 0.875rem;
  }
}

.currency-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  
  .currency-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    .currency-name {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .currency-value {
      font-weight: 600;
      color: var(--primary-color);
    }
  }
}

.recent-contracts {
  background-color: var(--bg-primary);
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: var(--text-primary);
  }
}

.recent-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.recent-item {
  background-color: var(--bg-secondary);
  border-radius: 4px;
  padding: 0.75rem;
  border-left: 3px solid var(--primary-color);
  
  .recent-title {
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }
  
  .recent-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    
    .recent-number {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    
    .recent-status {
      font-size: 0.75rem;
      padding: 0.125rem 0.375rem;
      border-radius: 10px;
      font-weight: 500;
      
      &.status-draft {
        background-color: var(--bg-muted);
        color: var(--text-secondary);
      }
      
      &.status-active {
        background-color: var(--success-light);
        color: var(--success-color);
      }
      
      &.status-expired {
        background-color: var(--danger-light);
        color: var(--danger-color);
      }
      
      &.status-terminated {
        background-color: var(--warning-light);
        color: var(--warning-color);
      }
      
      &.status-renewed {
        background-color: var(--info-light);
        color: var(--info-color);
      }
    }
  }
  
  .recent-date {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 