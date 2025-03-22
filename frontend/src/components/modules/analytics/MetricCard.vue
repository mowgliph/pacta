<template>
  <div class="metric-card" :class="colorClass">
    <div class="metric-icon">
      <i :class="icon"></i>
    </div>
    <div class="metric-content">
      <h3 class="metric-title">{{ title }}</h3>
      <div class="metric-value">{{ value }}</div>
      <div class="metric-trend" v-if="showTrend">
        <span 
          class="trend-indicator" 
          :class="{ 
            'positive': change > 0, 
            'negative': change < 0, 
            'neutral': change === 0 
          }"
        >
          <i :class="trendIcon"></i>
          {{ Math.abs(change).toFixed(1) }}%
        </span>
        <span class="trend-label">{{ trendLabel }}</span>
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

<style lang="scss" scoped>
@use './MetricCard.scss';
</style> 