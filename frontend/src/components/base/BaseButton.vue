<template>
  <button
    :class="[
      'inline-flex items-center justify-center relative overflow-hidden transition-all duration-200 font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses,
      variantClasses,
      { 'w-full': block },
      { 'aspect-square p-0': iconOnly },
      { 'opacity-65 cursor-not-allowed pointer-events-none': disabled || loading },
      { 'text-transparent': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <i v-if="icon && !iconRight" :class="['text-[1.2em] inline-flex', icon, { 'mr-1': !iconOnly }]"></i>
    <span v-if="!iconOnly" class="relative">
      <slot></slot>
    </span>
    <i v-if="icon && iconRight" :class="['text-[1.2em] inline-flex ml-1', icon]"></i>
    <span v-if="loading" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
      <span class="w-1.5 h-1.5 rounded-full bg-current mx-0.5 animate-loader1"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-current mx-0.5 animate-loader2"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-current mx-0.5 animate-loader3"></span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'tertiary', 'danger', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  iconOnly: {
    type: Boolean,
    default: false
  },
  iconRight: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return props.iconOnly ? 'w-7' : 'py-1 px-2 text-xs';
    case 'lg':
      return props.iconOnly ? 'w-11' : 'py-3 px-4 text-base';
    case 'md':
    default:
      return props.iconOnly ? 'w-9' : 'py-2 px-3 text-sm';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary text-white shadow-sm hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm focus:ring-primary';
    case 'secondary':
      return 'bg-surface text-text-primary border border-border rounded hover:bg-gray-100 hover:border-primary focus:ring-primary';
    case 'tertiary':
      return 'bg-primary/10 text-primary hover:bg-primary/20 focus:ring-primary';
    case 'danger':
      return 'bg-error text-white shadow-sm hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm focus:ring-error';
    case 'text':
      return 'bg-transparent text-primary hover:bg-primary/5 hover:text-primary-dark p-1 focus:ring-primary';
    default:
      return '';
  }
});
</script>

<style>
@keyframes loader {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-loader1 {
  animation: loader 1s infinite 0s;
}
.animate-loader2 {
  animation: loader 1s infinite 0.2s;
}
.animate-loader3 {
  animation: loader 1s infinite 0.4s;
}
</style>