<template>
  <button
    :class="[
      'btn',
      variantClasses,
      sizeClasses,
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
    validator: (value: string) => ['primary', 'secondary', 'tertiary', 'danger', 'outline', 'text'].includes(value)
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
      return props.iconOnly ? 'w-7 h-7' : 'text-xs py-1 px-2';
    case 'lg':
      return props.iconOnly ? 'w-11 h-11' : 'text-base py-3 px-4';
    case 'md':
    default:
      return props.iconOnly ? 'w-9 h-9' : 'text-sm';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'btn-primary';
    case 'secondary':
      return 'btn-secondary';
    case 'tertiary':
      return 'bg-primary/10 text-primary hover:bg-primary/20 focus:ring-primary';
    case 'danger':
      return 'btn-danger';
    case 'outline':
      return 'btn-outline';
    case 'text':
      return 'bg-transparent text-primary hover:bg-primary/5 hover:text-primary-dark p-1 focus:ring-primary';
    default:
      return 'btn-primary';
  }
});
</script>