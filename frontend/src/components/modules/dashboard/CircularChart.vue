<template>
  <div class="circular-chart-container" :class="{ 'animate-in': isVisible }">
    <div class="chart-title" v-if="title">{{ title }}</div>
    <div class="chart-wrapper">
      <svg class="circular-chart" viewBox="0 0 36 36">
        <path class="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <path class="circle"
              :stroke="color"
              :stroke-dasharray="`${percentage}, 100`"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <text x="18" y="19" class="chart-value">{{ percentage }}%</text>
      </svg>
      <div class="chart-label">{{ label }}</div>
    </div>
    <div class="chart-description" v-if="description">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  percentage: {
    type: Number,
    required: true,
    validator: (value: number) => value >= 0 && value <= 100
  },
  color: {
    type: String,
    default: '#3498db'
  },
  label: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  animateOnVisible: {
    type: Boolean,
    default: true
  }
});

const isVisible = ref(false);

onMounted(() => {
  if (props.animateOnVisible) {
    // Usar IntersectionObserver si está disponible
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              isVisible.value = true;
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      
      const element = document.querySelector('.circular-chart-container');
      if (element) {
        observer.observe(element);
      }
    } else {
      // Fallback para navegadores que no soportan IntersectionObserver
      setTimeout(() => { isVisible.value = true; }, 100);
    }
  } else {
    isVisible.value = true;
  }
});

watch(() => props.percentage, () => {
  isVisible.value = false;
  setTimeout(() => { isVisible.value = true; }, 50);
});
</script>

<style lang="scss" scoped>
@use '../../../styles/variables' as v;
@use '../../../styles/colors' as c;
@use '../../../styles/mixins' as m;

.circular-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: v.$spacing-md;
  
  &.animate-in .circle {
    animation: circle-fill 1.5s ease-out forwards;
  }

  .chart-title {
    font-size: v.$font-size-md;
    font-weight: v.$font-weight-medium;
    margin-bottom: v.$spacing-sm;
    color: c.$color-text-primary;
    text-align: center;
  }
  
  .chart-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: v.$spacing-sm;
  }
  
  .circular-chart {
    width: 100px;
    height: 100px;
    
    .circle-bg {
      fill: none;
      stroke: rgba(c.$color-border, 0.2);
      stroke-width: 2.8;
    }
    
    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      stroke-dasharray: 0, 100;
    }
    
    .chart-value {
      font-size: 0.6rem;
      fill: c.$color-text-primary;
      font-weight: v.$font-weight-bold;
      text-anchor: middle;
      dominant-baseline: middle;
    }
  }
  
  .chart-label {
    font-size: v.$font-size-sm;
    color: c.$color-text-secondary;
    margin-top: v.$spacing-xs;
    text-align: center;
  }
  
  .chart-description {
    font-size: v.$font-size-xs;
    color: c.$color-text-secondary;
    margin-top: v.$spacing-sm;
    text-align: center;
    max-width: 180px;
    line-height: 1.4;
  }
}

@keyframes circle-fill {
  from {
    stroke-dasharray: 0, 100;
  }
}
</style> 