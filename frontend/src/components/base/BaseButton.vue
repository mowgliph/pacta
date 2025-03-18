<template>
  <button 
    :class="[
      'base-button',
      `base-button--${variant}`,
      { 'base-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <i v-if="icon" :class="icon" class="base-button__icon"></i>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger'].includes(value)
  },
  loading: Boolean,
  disabled: Boolean,
  icon: String
});
</script>

<style lang="scss" scoped>
.base-button {
  @include button-theme;
  @include button-text;
  display: inline-flex;
  align-items: center;
  gap: $spacing-unit;
  cursor: pointer;

  &--secondary {
    @include button-theme('secondary');
  }

  &--danger {
    @include button-theme('danger');
  }

  &__icon {
    font-size: 1rem;
  }
}
</style>