<template>
  <div class="base-select">
    <label v-if="label" :for="id" class="base-select__label">{{ label }}</label>
    <div class="base-select__field-wrapper">
      <select
        :id="id"
        class="base-select__field"
        :value="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        :class="{ 'base-select__field--error': error }"
      >
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <span v-if="error" class="base-select__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string;
  label: string;
}

defineProps<{
  label?: string;
  modelValue: string;
  options: Option[];
  error?: string;
  id: string;
  placeholder?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;

.base-select {
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
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right v.$spacing-md center;
    padding-right: v.$spacing-xl;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: c.$color-primary;
      box-shadow: 0 0 0 2px rgba(c.$color-primary, 0.1);
    }
    
    &:hover:not(:focus) {
      border-color: darken-compat(c.$color-border, 10%);
    }
    
    &--error {
      border-color: c.$color-error;
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(c.$color-error, 0.1);
      }
    }
  }

  &__error {
    color: c.$color-error;
    font-size: v.$font-size-xs;
    margin-top: v.$spacing-xs;
    transition: all v.$transition-fast;
  }
}
</style>