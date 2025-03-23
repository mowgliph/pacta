<template>
  <label class="checkbox-container">
    <span v-if="label" class="checkbox-label">{{ label }}</span>
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="handleChange"
      class="checkbox-input"
    />
    <span class="checkbox-checkmark"></span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  modelValue: boolean;
  id: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script> 