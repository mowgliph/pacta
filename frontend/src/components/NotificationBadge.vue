<template>
  <div 
    class="inline-flex items-center"
    :class="{ 'cursor-pointer': clickable }"
    @click="clickable && $emit('click')"
  >
    <div class="relative">
      <slot>
        <i class="fas fa-bell text-lg text-text-secondary dark:text-gray-400"></i>
      </slot>
      <transition
        enter-active-class="transform transition-all duration-300 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transform transition-all duration-200 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <div
          v-if="count > 0"
          class="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-medium text-white rounded-full px-1"
          :class="[
            variant === 'primary' ? 'bg-primary-500' : 'bg-error-500',
            pulseAnimation ? 'animate-pulse-badge' : ''
          ]"
        >
          {{ formattedCount }}
        </div>
      </transition>
    </div>
    <slot name="label">
      <span 
        v-if="label" 
        class="ml-2 text-sm text-text-secondary dark:text-gray-400"
        :class="{ 'font-medium': count > 0 }"
      >
        {{ label }}
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  count: number;
  label?: string;
  variant?: 'primary' | 'error';
  maxCount?: number;
  clickable?: boolean;
  pulseAnimation?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const formattedCount = computed(() => {
  if (!props.maxCount) return props.count;
  return props.count > props.maxCount ? `${props.maxCount}+` : props.count;
});
</script>

<style scoped>
@keyframes pulse-badge {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-badge {
  animation: pulse-badge 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 