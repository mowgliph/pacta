<template>
  <div class="flex flex-col items-center justify-center p-4" :class="{ 'animate-chart-in': isVisible }">
    <div v-if="title" class="text-base font-medium mb-2 text-text-primary text-center">{{ title }}</div>
    <div class="flex flex-col items-center p-2">
      <svg class="w-[100px] h-[100px]" viewBox="0 0 36 36">
        <path class="fill-none stroke-border/20 stroke-[2.8]"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <path class="fill-none stroke-[2.8] stroke-linecap-round chart-circle"
              :stroke="color"
              :stroke-dasharray="`${percentage}, 100`"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"/>
        <text x="18" y="19" class="text-[0.6rem] fill-text-primary font-bold text-anchor-middle">{{ percentage }}%</text>
      </svg>
      <div class="text-sm text-text-secondary mt-1 text-center">{{ label }}</div>
    </div>
    <div v-if="description" class="text-xs text-text-secondary mt-2 text-center max-w-[180px] leading-relaxed">{{ description }}</div>
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
      
      const element = document.querySelector('.flex.flex-col.items-center.justify-center.p-4');
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

<style>
@keyframes circle-fill {
  from {
    stroke-dasharray: 0, 100;
  }
}

.animate-chart-in .chart-circle {
  animation: circle-fill 1.5s ease-out forwards;
}

/* Estas clases no existen en Tailwind por defecto */
.text-anchor-middle {
  text-anchor: middle;
  dominant-baseline: middle;
}
</style> 