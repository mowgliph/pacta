<template>
  <div class="bg-surface rounded-lg shadow-sm p-4">
    <h3 class="text-lg font-semibold text-text-primary mb-4">Contract Statistics</h3>
    
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-surface-hover p-3 rounded shadow-sm">
        <span class="block text-sm text-text-secondary mb-1">Active Contracts</span>
        <span class="text-xl font-bold text-text-primary">{{ stats.active }}</span>
      </div>
      
      <div class="bg-white dark:bg-surface-hover p-3 rounded shadow-sm">
        <span class="block text-sm text-text-secondary mb-1">Expiring Soon</span>
        <span class="text-xl font-bold text-warning">{{ stats.expiringSoon }}</span>
      </div>
      
      <div class="bg-white dark:bg-surface-hover p-3 rounded shadow-sm">
        <span class="block text-sm text-text-secondary mb-1">Expired</span>
        <span class="text-xl font-bold text-error">{{ stats.expired }}</span>
      </div>
    </div>

    <div class="h-48">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useContractStore } from '../../../stores/contract';

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