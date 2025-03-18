<template>
  <span :class="['status-badge', `status-badge--${status}`]">
    <BaseIcon :name="getStatusIcon" :size="'sm'" class="status-badge__icon" />
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '@/components/base/BaseIcon.vue';

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
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-unit;
  padding: $spacing-unit $spacing-unit * 2;
  border-radius: $border-radius;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  text-transform: capitalize;

  &__icon {
    width: 16px;
    height: 16px;
  }

  &--active {
    background: rgba($color-success, 0.1);
    color: $color-success;
  }

  &--expired {
    background: rgba($color-error, 0.1);
    color: $color-error;
  }

  &--draft {
    background: rgba($color-text-secondary, 0.1);
    color: $color-text-secondary;
  }

  &--terminated {
    background: rgba($color-error, 0.1);
    color: $color-error;
  }

  &--renewed {
    background: rgba($color-info, 0.1);
    color: $color-info;
  }
}
</style>