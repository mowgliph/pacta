<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="base-input__label">{{ label }}</label>
    <div class="base-input__field-wrapper">
      <input
        :id="id"
        class="base-input__field"
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :class="{ 'base-input__field--error': error }"
      />
      <div v-if="$slots.icon" class="base-input__icon">
        <slot name="icon"></slot>
      </div>
    </div>
    <span v-if="error" class="base-input__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  modelValue: string;
  error?: string;
  id: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;

.base-input {
  display: flex;
  flex-direction: column;
  gap: v.$spacing-xs;
  width: 100%;

  &__label {
    @include m.form-label;
    font-weight: v.$font-weight-medium;
    transition: color v.$transition-fast;
  }

  &__field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__field {
    width: 100%;
    padding: v.$spacing-sm v.$spacing-md;
    border: 1px solid c.$color-border;
    border-radius: v.$border-radius-md;
    font-size: v.$font-size-sm;
    transition: all v.$transition-normal;
    background-color: c.$color-surface;
    color: c.$color-text-primary;
    
    &:focus {
      outline: none;
      border-color: c.$color-primary;
      box-shadow: 0 0 0 2px rgba(c.$color-primary, 0.1);
    }
    
    &:hover:not(:focus) {
      border-color: darken-compat(c.$color-border, 10%);
    }
    
    &::placeholder {
      color: c.$color-text-disabled;
    }
    
    &--error {
      border-color: c.$color-error;
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(c.$color-error, 0.1);
      }
    }
  }

  &__icon {
    position: absolute;
    right: v.$spacing-sm;
    display: flex;
    align-items: center;
    justify-content: center;
    color: c.$color-text-secondary;
  }

  &__error {
    color: c.$color-error;
    font-size: v.$font-size-xs;
    margin-top: v.$spacing-xs;
    transition: all v.$transition-fast;
  }
}
</style>