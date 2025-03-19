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
@use '../../assets/styles/_variables.scss' as v;
@use '../../assets/styles/_colors.scss' as c;

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: v.$spacing-unit;
  padding: v.$spacing-unit v.$spacing-unit * 2;
  border-radius: v.$border-radius;
  font-size: v.$font-size-sm;
  font-weight: v.$font-weight-medium;
  text-transform: capitalize;

  &__icon {
    width: 16px;
    height: 16px;
  }

  &--active {
    background: rgba(c.$color-success, 0.1);
    color: c.$color-success;
  }

  &--expired {
    background: rgba(c.$color-error, 0.1);
    color: c.$color-error;
  }

  &--draft {
    background: rgba(c.$color-text-secondary, 0.1);
    color: c.$color-text-secondary;
  }

  &--terminated {
    background: rgba(c.$color-error, 0.1);
    color: c.$color-error;
  }

  &--renewed {
    background: rgba(c.$color-info, 0.1);
    color: c.$color-info;
  }
}
</style>
