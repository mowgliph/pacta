<template>
  <div class="analytics-chart">
    <div class="chart-header">
      <h3 v-if="title">{{ title }}</h3>
      
      <div v-if="showControls" class="chart-controls">
        <div v-if="periodSelector" class="period-selector">
          <button 
            v-for="period in periods" 
            :key="period.value"
            class="btn-period"
            :class="{ active: selectedPeriod === period.value }"
            @click="handlePeriodChange(period.value)"
          >
            {{ period.label }}
          </button>
        </div>
        
        <div class="chart-actions">
          <button 
            v-for="chartType in availableChartTypes" 
            :key="chartType.value"
            class="btn-chart-type"
            :class="{ active: currentType === chartType.value }"
            @click="currentType = chartType.value"
            :title="chartType.label"
          >
            <i :class="chartType.icon"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="chart-container" :style="{ height: `${height}px` }">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div v-if="showFooter && footnote" class="chart-footer">
      <span class="footnote">{{ footnote }}</span>
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

<style lang="scss" scoped>
@use './AnalyticsChart.scss';
</style> 