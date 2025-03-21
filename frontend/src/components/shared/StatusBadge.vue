<template>
  <span :class="['status-badge', `status-badge--${status}`]">
    <BaseIcon :name="getStatusIcon" :size="'sm'" class="status-badge__icon" />
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

<style lang="scss" scoped>
@use './statusBadge.scss';
</style>
