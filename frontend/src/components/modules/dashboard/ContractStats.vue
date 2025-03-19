<template>
  <div class="contract-stats">
    <h3 class="contract-stats__title">Contract Statistics</h3>
    
    <div class="contract-stats__grid">
      <div class="stat-card">
        <span class="stat-card__label">Active Contracts</span>
        <span class="stat-card__value">{{ stats.active }}</span>
      </div>
      
      <div class="stat-card">
        <span class="stat-card__label">Expiring Soon</span>
        <span class="stat-card__value stat-card__value--warning">{{ stats.expiringSoon }}</span>
      </div>
      
      <div class="stat-card">
        <span class="stat-card__label">Expired</span>
        <span class="stat-card__value stat-card__value--danger">{{ stats.expired }}</span>
      </div>
    </div>

    <div class="contract-stats__chart">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useContractStore } from '@/stores/contract';

Chart.register(...registerables);

const chartRef = ref<HTMLCanvasElement | null>(null);
const contractStore = useContractStore();

const stats = reactive({
  active: 0,
  expiringSoon: 0,
  expired: 0
});

onMounted(async () => {
  await loadStats();
  initChart();
});

async function loadStats() {
  const contractStats = await contractStore.getContractStats();
  Object.assign(stats, contractStats);
}

function initChart() {
  if (!chartRef.value) return;

  new Chart(chartRef.value, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Expiring Soon', 'Expired'],
      datasets: [{
        data: [stats.active, stats.expiringSoon, stats.expired],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
</script>

<style lang="scss" scoped>
@import '../../../assets/main.scss';

.contract-stats {
  &__title {
    color: var(--color-text-primary);
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-unit * 4;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-unit * 4;
    margin-bottom: $spacing-unit * 6;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-unit * 4;
  background: var(--color-surface);
  border-radius: $border-radius;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &__label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: $spacing-unit;
  }

  &__value {
    font-size: 1.5rem;
    font-weight: $font-weight-bold;
    color: var(--color-primary);

    &--warning {
      color: var(--color-warning);
    }

    &--danger {
      color: var(--color-error);
    }
  }
}
</style>