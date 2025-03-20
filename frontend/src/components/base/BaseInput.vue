<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="base-input__label">{{ label }}</label>
    <input
      :id="id"
      class="base-input__field"
      v-bind="$attrs"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
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
@use '../../styles/typography' as t;

.base-input {
  &__label {
    @include m.form-label;
  }

  display: flex;
  flex-direction: column;
  gap: v.$spacing-unit;

  &__field {
    @include m.input-theme;
  }

  &__error {
    color: c.$color-error;
    font-size: 0.875rem;
  }
}
</style>