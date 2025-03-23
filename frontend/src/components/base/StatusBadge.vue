<template>
  <span :class="[
    'inline-block py-1 px-3 rounded text-sm font-medium capitalize',
    statusClasses
  ]">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'active' | 'inactive' | 'expired'
}>();

const statusClasses = computed(() => {
  switch (props.status) {
    case 'active':
      return 'bg-success/10 text-success';
    case 'inactive':
      return 'bg-warning/10 text-warning';
    case 'expired':
      return 'bg-error/10 text-error';
    default:
      return '';
  }
});
</script>