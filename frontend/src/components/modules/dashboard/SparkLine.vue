<template>
  <div class="w-full flex flex-col">
    <div v-if="title" class="flex justify-between items-baseline mb-1">
      <div class="text-xs text-text-secondary">{{ title }}</div>
      <div class="text-sm font-medium text-text-primary" 
           :class="{ 'text-success': trendClass === 'positive', 'text-error': trendClass === 'negative' }">
        {{ formattedValue }}
        <span v-if="showTrend" class="text-xs ml-1">
          <i :class="trendIconClass" class="mr-0.5"></i>
          {{ trendValue }}
        </span>
      </div>
    </div>
    <svg class="w-full h-auto my-1 sparkline-svg" :viewBox="`0 0 ${width} ${height}`">
      <path
        :d="pathD"
        fill="none"
        :stroke="lineColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="sparkline-path"
      />
      <circle
        v-if="showLastPoint"
        :cx="points[points.length - 1][0]"
        :cy="points[points.length - 1][1]"
        r="2"
        :fill="lastPointColor || lineColor"
        class="sparkline-point"
      />
      <circle
        v-if="showFirstPoint"
        :cx="points[0][0]"
        :cy="points[0][1]"
        r="2"
        :fill="firstPointColor || lineColor"
        class="sparkline-point"
      />
    </svg>
    <div v-if="label" class="text-xs text-text-secondary text-center mt-1">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  data: {
    type: Array as () => number[],
    required: true
  },
  width: {
    type: Number,
    default: 100
  },
  height: {
    type: Number,
    default: 30
  },
  lineColor: {
    type: String,
    default: '#3498db'
  },
  title: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [Number, String],
    default: null
  },
  trend: {
    type: Number,
    default: 0
  },
  trendUnit: {
    type: String,
    default: '%'
  },
  showTrend: {
    type: Boolean,
    default: true
  },
  showLastPoint: {
    type: Boolean,
    default: true
  },
  showFirstPoint: {
    type: Boolean,
    default: false
  },
  firstPointColor: {
    type: String,
    default: null
  },
  lastPointColor: {
    type: String,
    default: null
  }
});

const animationRef = ref<any>(null);
const animated = ref(false);

onMounted(() => {
  if (typeof window !== 'undefined') {
    // Animar gradualmente la aparición del sparkline
    animationRef.value = requestAnimationFrame(() => animate());
  }
});

const animate = () => {
  animated.value = true;
};

const formattedValue = computed(() => {
  if (props.value === null) {
    // Si no hay un valor explícito, tomar el último elemento en los datos
    const lastValue = props.data[props.data.length - 1];
    return typeof lastValue === 'number' ? lastValue.toLocaleString() : lastValue;
  }
  return typeof props.value === 'number' ? props.value.toLocaleString() : props.value;
});

const trendClass = computed(() => {
  if (props.trend > 0) return 'positive';
  if (props.trend < 0) return 'negative';
  return '';
});

const trendIconClass = computed(() => {
  if (props.trend > 0) return 'fas fa-arrow-up';
  if (props.trend < 0) return 'fas fa-arrow-down';
  return 'fas fa-minus';
});

const trendValue = computed(() => {
  const absValue = Math.abs(props.trend);
  return `${absValue}${props.trendUnit}`;
});

const points = computed(() => {
  const { data, width, height } = props;
  
  if (!data.length) return [];
  
  // Encontrar min y max para escalar
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Evitar división por cero
  
  const padding = 2; // Padding para evitar que toque los bordes
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  return data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = height - padding - ((value - min) / range) * chartHeight;
    return [x, y];
  });
});

const pathD = computed(() => {
  if (!points.value.length) return '';
  
  const path = points.value.map((point, i) => {
    return `${i === 0 ? 'M' : 'L'}${point[0]},${point[1]}`;
  }).join(' ');
  
  return path;
});
</script>

<style>
/* Definimos las animaciones que necesitamos */
.sparkline-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: sparkline-dash 1.5s ease-in-out forwards;
}

.sparkline-point {
  opacity: 0;
  animation: sparkline-fade-in 0.3s ease-in-out 1.3s forwards;
}

@keyframes sparkline-dash {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes sparkline-fade-in {
  to {
    opacity: 1;
  }
}
</style> 