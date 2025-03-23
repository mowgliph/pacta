<template>
  <div 
    class="flex p-4 lg:p-5 bg-surface dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden relative"
    :class="{
      'border-l-4 border-l-primary': colorClass === 'primary',
      'border-l-4 border-l-success': colorClass === 'success',
      'border-l-4 border-l-warning': colorClass === 'warning',
      'border-l-4 border-l-error': colorClass === 'error',
      'border-l-4 border-l-info': colorClass === 'info'
    }"
  >
    <div 
      class="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3 lg:mr-4"
    >
      <i 
        :class="[
          icon, 
          {
            'text-primary': colorClass === 'primary',
            'text-success': colorClass === 'success',
            'text-warning': colorClass === 'warning',
            'text-error': colorClass === 'error',
            'text-info': colorClass === 'info'
          }
        ]"
        class="text-xl lg:text-2xl"
      ></i>
    </div>
    <div class="flex-1 flex flex-col justify-center">
      <h3 class="text-sm text-gray-500 dark:text-gray-400 m-0 mb-0.5 font-medium">{{ title }}</h3>
      <div class="text-xl lg:text-2xl font-bold mb-0.5 text-gray-900 dark:text-white">{{ value }}</div>
      <div class="flex items-center gap-2 text-xs" v-if="showTrend">
        <span 
          class="flex items-center gap-0.5"
          :class="{ 
            'text-success': change > 0, 
            'text-error': change < 0, 
            'text-gray-500': change === 0 
          }"
        >
          <i :class="trendIcon"></i>
          {{ Math.abs(change).toFixed(1) }}%
        </span>
        <span class="text-gray-500 dark:text-gray-400">{{ trendLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Props
interface Props {
  title: string;
  value: string | number;
  icon?: string;
  change?: number;
  colorClass?: string;
  showTrend?: boolean;
  trendLabel?: string;
  invertTrend?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'fas fa-chart-line',
  change: 0,
  colorClass: 'primary',
  showTrend: true,
  trendLabel: 'vs período anterior',
  invertTrend: false
});

// Computed
const trendIcon = computed(() => {
  const isPositive = props.invertTrend ? props.change < 0 : props.change > 0;
  const isNegative = props.invertTrend ? props.change > 0 : props.change < 0;

  if (isPositive) return 'fas fa-arrow-up';
  if (isNegative) return 'fas fa-arrow-down';
  return 'fas fa-minus';
});
</script>