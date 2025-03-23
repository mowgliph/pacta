<template>
  <div class="flex items-center gap-4">
    <label v-if="label" :for="id" class="form-label cursor-pointer m-0">{{ label }}</label>
    <div class="toggle-container">
      <input
        type="checkbox"
        :id="id"
        :checked="modelValue"
        @change="handleChange"
        class="toggle-input"
      />
      <span class="toggle-slider"></span>
    </div>
  </div>
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