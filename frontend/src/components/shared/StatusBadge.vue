<template>
  <span :class="[
    'inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium capitalize',
    status === 'active' ? 'bg-success/10 text-success' : 
    status === 'expired' ? 'bg-error/10 text-error' :
    status === 'draft' ? 'bg-text-secondary/10 text-text-secondary' :
    status === 'terminated' ? 'bg-error/10 text-error' :
    status === 'renewed' ? 'bg-info/10 text-info' : 'bg-warning/10 text-warning'
  ]">
    <BaseIcon :name="getStatusIcon" :size="'sm'" class="w-3.5 h-3.5" />
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../../components/base/BaseIcon.vue';

const props = defineProps<{
  status: 'active' | 'expired' | 'draft' | 'terminated' | 'renewed';
}>();

const getStatusIcon = computed(() => {
  const icons = {
    active: 'checkCircle',
    expired: 'alertCircle',
    draft: 'edit',
    terminated: 'closeCircle',
    renewed: 'refresh'
  } as const;
  return icons[props.status];
});
</script>
