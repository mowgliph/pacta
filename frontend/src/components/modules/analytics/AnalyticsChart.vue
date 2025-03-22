<template>
  <div class="analytics-chart" :class="{ 'loading': loading }">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="chart-controls" v-if="showControls">
        <div v-if="periodSelector" class="period-selector">
          <button 
            v-for="(period, i) in periods" 
            :key="i" 
            :class="{ active: selectedPeriod === period.value }"
            @click="handlePeriodChange(period.value)"
          >
            {{ period.label }}
          </button>
        </div>
        <div class="chart-type-selector" v-if="typeSelector">
          <button 
            v-for="(type, i) in chartTypes" 
            :key="i"
            :class="{ active: selectedType === type.value }"
            @click="handleTypeChange(type.value)"
          >
            <i :class="type.icon"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="chart-skeleton">
      <div class="skeleton-pulse"></div>
    </div>
    
    <div v-else-if="error" class="chart-error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="reloadChart">Reintentar</button>
    </div>
    
    <div v-else class="chart-content" :style="{ height: `${height}px` }">
      <!-- Chart Canvas -->
      <canvas ref="chartCanvas"></canvas>
      
      <!-- Fallback - Placeholder Chart -->
      <div v-if="!chartData || chartData.datasets.length === 0" class="chart-placeholder">
        <div class="no-data-message">
          <i class="fas fa-chart-line"></i>
          <p>No hay datos disponibles para el período seleccionado.</p>
        </div>
      </div>
    </div>
    
    <div class="chart-footer" v-if="showFooter">
      <div class="chart-legend" v-if="chartData && chartData.datasets.length > 0">
        <div 
          v-for="(dataset, i) in chartData.datasets" 
          :key="i"
          class="legend-item"
        >
          <span class="legend-color" :style="{ backgroundColor: Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor }"></span>
          <span class="legend-label">{{ dataset.label }}</span>
        </div>
      </div>
      
      <div class="chart-footnote" v-if="footnote">
        <p>{{ footnote }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import Chart from 'chart.js/auto';
import { CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js';

// Registrar componentes Chart.js
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title);

// Props
interface Props {
  title: string;
  chartData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  type?: 'bar' | 'line' | 'pie' | 'doughnut';
  height?: number;
  loading?: boolean;
  error?: string | null;
  showControls?: boolean;
  periodSelector?: boolean;
  typeSelector?: boolean;
  showFooter?: boolean;
  footnote?: string;
  customOptions?: any;
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  type: 'bar',
  loading: false,
  error: null,
  showControls: false,
  periodSelector: false,
  typeSelector: false,
  showFooter: false,
  footnote: '',
  customOptions: () => ({})
});

// Emits
const emit = defineEmits(['period-change', 'type-change', 'reload']);

// State
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const chartInstance = ref<Chart | null>(null);
const selectedPeriod = ref('30d');
const selectedType = ref(props.type);

// Chart Configuration
const periods = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1A', value: '1y' }
];

const chartTypes = [
  { label: 'Barras', value: 'bar' as const, icon: 'fas fa-chart-bar' },
  { label: 'Línea', value: 'line' as const, icon: 'fas fa-chart-line' },
  { label: 'Pastel', value: 'pie' as const, icon: 'fas fa-chart-pie' }
];

// Methods
const createChart = () => {
  if (!chartCanvas.value || !props.chartData || props.chartData.datasets.length === 0) return;
  
  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;
  
  // Destroy existing chart if it exists
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
  
  // Default options based on chart type
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        bodyFont: {
          size: 12
        },
        titleFont: {
          size: 13,
          weight: 'bold'
        }
      }
    }
  };
  
  // Specific options for different chart types
  const typeSpecificOptions = {
    bar: {
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    },
    line: {
      elements: {
        line: {
          tension: 0.3
        },
        point: {
          radius: 3,
          hoverRadius: 5
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    },
    pie: {
      cutout: '0%'
    },
    doughnut: {
      cutout: '60%'
    }
  };
  
  // Merge options
  const chartOptions = {
    ...defaultOptions,
    ...(typeSpecificOptions[selectedType.value as keyof typeof typeSpecificOptions] || {}),
    ...props.customOptions
  };
  
  // Create chart
  chartInstance.value = new Chart(ctx, {
    type: selectedType.value,
    data: props.chartData,
    options: chartOptions
  });
};

const handlePeriodChange = (period: string) => {
  selectedPeriod.value = period;
  emit('period-change', period);
};

const handleTypeChange = (type: 'bar' | 'line' | 'pie' | 'doughnut') => {
  selectedType.value = type;
  createChart();
  emit('type-change', type);
};

const reloadChart = () => {
  emit('reload');
};

// Lifecycle hooks
onMounted(() => {
  if (!props.loading && !props.error && props.chartData) {
    createChart();
  }
});

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
});

// Watch for changes in props to update chart
watch(() => props.chartData, (newData) => {
  if (newData && !props.loading && !props.error) {
    createChart();
  }
}, { deep: true });

watch(() => props.loading, (isLoading) => {
  if (!isLoading && props.chartData && !props.error) {
    createChart();
  }
});

watch(() => props.type, (newType) => {
  if (newType !== selectedType.value) {
    selectedType.value = newType;
    createChart();
  }
});
</script>

<style lang="scss" scoped>
@use './AnalyticsChart.scss';
</style> 