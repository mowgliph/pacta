<template>
  <div class="sparkline-container">
    <div class="sparkline-header" v-if="title">
      <div class="sparkline-title">{{ title }}</div>
      <div class="sparkline-value" :class="trendClass">
        {{ formattedValue }}
        <span class="trend-indicator" v-if="showTrend">
          <i :class="trendIconClass"></i>
          {{ trendValue }}
        </span>
      </div>
    </div>
    <svg class="sparkline" :viewBox="`0 0 ${width} ${height}`">
      <path
        :d="pathD"
        fill="none"
        :stroke="lineColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        v-if="showLastPoint"
        :cx="points[points.length - 1][0]"
        :cy="points[points.length - 1][1]"
        r="2"
        :fill="lastPointColor || lineColor"
      />
      <circle
        v-if="showFirstPoint"
        :cx="points[0][0]"
        :cy="points[0][1]"
        r="2"
        :fill="firstPointColor || lineColor"
      />
    </svg>
    <div class="sparkline-label" v-if="label">{{ label }}</div>
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

<style lang="scss" scoped>
@use '../../../styles/variables' as v;
@use '../../../styles/colors' as c;
@use '../../../styles/mixins' as m;

.sparkline-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  
  .sparkline-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: v.$spacing-xs;
    
    .sparkline-title {
      font-size: v.$font-size-xs;
      color: c.$color-text-secondary;
    }
    
    .sparkline-value {
      font-size: v.$font-size-sm;
      font-weight: v.$font-weight-medium;
      color: c.$color-text-primary;
      
      &.positive {
        color: c.$color-success;
      }
      
      &.negative {
        color: c.$color-error;
      }
      
      .trend-indicator {
        font-size: v.$font-size-xs;
        margin-left: v.$spacing-xs;
        
        i {
          margin-right: 2px;
        }
      }
    }
  }
  
  .sparkline {
    width: 100%;
    height: auto;
    margin: v.$spacing-xs 0;
    path {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: dash 1.5s ease-in-out forwards;
    }
    
    circle {
      opacity: 0;
      animation: fadeIn 0.3s ease-in-out 1.3s forwards;
    }
  }
  
  .sparkline-label {
    font-size: v.$font-size-xs;
    color: c.$color-text-secondary;
    text-align: center;
    margin-top: v.$spacing-xs;
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style> 