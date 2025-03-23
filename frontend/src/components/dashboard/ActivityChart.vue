<template>
  <div class="card h-[400px]">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-medium text-text-primary">Actividad de Contratos</h2>
      <div class="flex items-center gap-2">
        <select 
          v-model="selectedRange" 
          class="text-sm border border-border rounded px-2 py-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
          @change="updateChart"
        >
          <option value="7">Última Semana</option>
          <option value="30">Último Mes</option>
          <option value="90">Último Trimestre</option>
          <option value="365">Último Año</option>
        </select>
      </div>
    </div>
    <div class="w-full h-[320px]" ref="chartContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useTheme } from '@/composables/useTheme';

Chart.register(...registerables);

const props = defineProps<{
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  }
}>();

const selectedRange = ref('30');
const chartContainer = ref<HTMLElement | null>(null);
const chart = ref<Chart | null>(null);
const { isDark } = useTheme();

const emit = defineEmits<{
  (e: 'range-change', days: number): void;
}>();

function updateChart() {
  if (!chartContainer.value || !props.data) return;

  if (chart.value) {
    chart.value.destroy();
  }

  const ctx = (chartContainer.value as HTMLCanvasElement).getContext('2d');
  if (!ctx) return;

  chart.value = new Chart(ctx, {
    type: 'line',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: isDark.value ? '#e5e7eb' : '#374151'
          }
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
          titleColor: isDark.value ? '#e5e7eb' : '#111827',
          bodyColor: isDark.value ? '#e5e7eb' : '#374151',
          borderColor: isDark.value ? '#374151' : '#e5e7eb',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: isDark.value ? '#374151' : '#e5e7eb',
            drawBorder: false
          },
          ticks: {
            color: isDark.value ? '#e5e7eb' : '#374151'
          }
        },
        y: {
          grid: {
            color: isDark.value ? '#374151' : '#e5e7eb',
            drawBorder: false
          },
          ticks: {
            color: isDark.value ? '#e5e7eb' : '#374151',
            precision: 0
          },
          beginAtZero: true
        }
      }
    }
  });
}

watch(() => selectedRange.value, (newValue) => {
  emit('range-change', parseInt(newValue));
});

watch(() => props.data, () => {
  updateChart();
}, { deep: true });

watch(() => isDark.value, () => {
  updateChart();
});

onMounted(() => {
  updateChart();
});
</script> 