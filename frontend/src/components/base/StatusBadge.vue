<template>
  <span :class="['status-badge', `status-badge--${status}`]">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  status: 'active' | 'inactive' | 'expired'
}>();
</script>

<style lang="scss" scoped>

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: v.$border-radius;
  font-size: 0.875rem;
  font-weight: v.$font-weight-medium;
  text-transform: capitalize;

  &--active {
    background-color: rgba(c.$color-success, 0.1);
    color: c.$color-success;
  }

  &--inactive {
    background-color: rgba(c.$color-warning, 0.1);
    color: c.$color-warning;
  }

  &--expired {
    background-color: rgba(c.$color-error, 0.1);
    color: c.$color-error;
  }
}
</style>