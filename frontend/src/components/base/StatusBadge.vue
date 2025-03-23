<template>
  <span :class="[
    'badge',
    statusClasses
  ]">
    <i v-if="showIcon" :class="statusIcon" class="mr-1.5 text-xs"></i>
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  status: 'active' | 'inactive' | 'expired' | 'pending' | 'draft' | 'terminated' | 'renewed';
  showIcon?: boolean;
  customLabels?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  customLabels: () => ({})
});

const statusClasses = computed(() => {
  switch (props.status) {
    case 'active':
      return 'badge-success';
    case 'pending':
      return 'badge-warning';
    case 'inactive':
      return 'badge-secondary';
    case 'expired':
      return 'badge-error';
    case 'draft':
      return 'badge-info';
    case 'terminated':
      return 'badge-secondary';
    case 'renewed':
      return 'badge-info';
    default:
      return 'badge-primary';
  }
});

const statusIcon = computed(() => {
  switch (props.status) {
    case 'active':
      return 'fas fa-check-circle';
    case 'pending':
      return 'fas fa-clock';
    case 'inactive':
      return 'fas fa-pause-circle';
    case 'expired':
      return 'fas fa-times-circle';
    case 'draft':
      return 'fas fa-edit';
    case 'terminated':
      return 'fas fa-ban';
    case 'renewed':
      return 'fas fa-sync';
    default:
      return 'fas fa-circle';
  }
});

const statusLabel = computed(() => {
  if (props.customLabels[props.status]) {
    return props.customLabels[props.status];
  }
  return props.status;
});
</script>