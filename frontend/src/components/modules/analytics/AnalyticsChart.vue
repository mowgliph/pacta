<template>
  <div class="bg-surface dark:bg-gray-800 rounded-lg p-4 h-full flex flex-col shadow-sm transition-all duration-250 hover:shadow-md">
    <div class="flex justify-between items-center mb-4 pb-2 border-b border-border dark:border-gray-700">
      <h3 v-if="title" class="text-base font-semibold text-text-primary dark:text-white m-0 flex-1">{{ title }}</h3>
      
      <div v-if="showControls" class="flex items-center gap-2">
        <div v-if="periodSelector" class="flex gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
          <button 
            v-for="period in periods" 
            :key="period.value"
            class="px-2 py-1 border-none bg-transparent text-sm cursor-pointer rounded-md text-text-secondary dark:text-gray-400 transition-all duration-200"
            :class="{ 'bg-white dark:bg-gray-600 text-primary dark:text-primary-light font-medium shadow-sm': selectedPeriod === period.value }"
            @click="handlePeriodChange(period.value)"
          >
            {{ period.label }}
          </button>
        </div>
        
        <div class="flex gap-1">
          <button 
            v-for="chartType in availableChartTypes" 
            :key="chartType.value"
            class="w-7 h-7 flex items-center justify-center border-none bg-gray-100 dark:bg-gray-700 rounded-md text-text-secondary dark:text-gray-400 cursor-pointer transition-all duration-200"
            :class="{ 'bg-primary text-white': currentType === chartType.value }"
            @click="currentType = chartType.value"
            :title="chartType.label"
          >
            <i :class="chartType.icon"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="flex-1 relative w-full" :style="{ height: `${height}px` }">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div v-if="showFooter && footnote" class="mt-2 pt-1 border-t border-border dark:border-gray-700">
      <span class="text-xs text-text-secondary dark:text-gray-400 italic">{{ footnote }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

// Types
interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  [key: string]: any;
}

// Props
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  chartData: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    default: 'line',
    validator: (value: string) => {
      return ['line', 'bar', 'doughnut', 'pie', 'radar', 'polarArea'].includes(value);
    }
  },
  height: {
    type: Number,
    default: 300
  },
  showControls: {
    type: Boolean,
    default: false
  },
  periodSelector: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: false
  },
  footnote: {
    type: String,
    default: ''
  },
  options: {
    type: Object,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['period-change']);

// Refs
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chart = ref<Chart | null>(null);

// State
const currentType = ref(props.type);
const selectedPeriod = ref('30d');

// Computed
const availableChartTypes = computed(() => {
  const baseTypes = [
    { value: 'line', label: 'Línea', icon: 'fas fa-chart-line' },
    { value: 'bar', label: 'Barras', icon: 'fas fa-chart-bar' }
  ];
  
  // Para datos circulares, mostramos también estos tipos
  const isCircularDataset = props.chartData.datasets && props.chartData.datasets.length === 1;
  
  if (isCircularDataset) {
    baseTypes.push(
      { value: 'doughnut', label: 'Dona', icon: 'fas fa-chart-pie' },
      { value: 'pie', label: 'Circular', icon: 'fas fa-circle' }
    );
  }
  
  return baseTypes;
});

const periods = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1A' }
];

// Methods
function createChart() {
  if (!chartCanvas.value) return;
  
  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;
  
  // Destruir el gráfico anterior si existe
  if (chart.value) {
    chart.value.destroy();
  }
  
  // Configuraciones específicas por tipo de gráfico
  let specificOptions = {};
  
  if (currentType.value === 'line') {
    specificOptions = {
      tension: 0.3,
      fill: false,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5
    };
  } else if (currentType.value === 'bar') {
    specificOptions = {
      borderWidth: 1,
      borderRadius: 4,
      maxBarThickness: 40
    };
  } else if (['doughnut', 'pie'].includes(currentType.value)) {
    specificOptions = {
      borderWidth: 1,
      hoverOffset: 15,
      borderColor: '#fff'
    };
  }
  
  // Crear el nuevo gráfico
  chart.value = new Chart(ctx, {
    type: currentType.value as any,
    data: {
      ...props.chartData,
      datasets: props.chartData.datasets.map((dataset: Dataset) => ({
        ...dataset,
        ...specificOptions
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 750,
        easing: 'easeOutQuint'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#1f2937',
          bodyColor: '#4b5563',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            }
          }
        }
      },
      scales: currentType.value !== 'doughnut' && currentType.value !== 'pie' ? {
        x: {
          grid: {
            color: 'rgba(200, 200, 200, 0.2)',
            borderDash: [5, 5]
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(200, 200, 200, 0.2)',
            borderDash: [5, 5]
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      } : undefined,
      ...props.options
    }
  });
}

function handlePeriodChange(period: string) {
  selectedPeriod.value = period;
  emit('period-change', period);
}

// Watchers
watch(() => props.chartData, () => {
  createChart();
}, { deep: true });

watch(() => currentType.value, () => {
  createChart();
});

watch(() => props.type, (newType) => {
  currentType.value = newType;
});

// Lifecycle hooks
onMounted(() => {
  createChart();
});
</script>

<style>
/* Se usa Tailwind para estilos, y Chart.js tiene su propio estilo interno */
@keyframes pulse {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
} 
</style> 