<template>
  <div class="base-select">
    <label v-if="label" :for="id" class="base-select__label">{{ label }}</label>
    <select
      :id="id"
      class="base-select__field"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
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
.base-select {
  display: flex;
  flex-direction: column;
  gap: $spacing-unit;

  &__label {
    color: $color-text-secondary;
    font-weight: $font-weight-medium;
  }

  &__field {
    @include input-theme;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%234c5c68' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right $spacing-unit * 2 center;
    padding-right: $spacing-unit * 5;
  }

  &__error {
    color: $color-error;
    font-size: 0.875rem;
  }
}
</style>