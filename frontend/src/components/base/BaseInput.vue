<template>
  <div class="form-control w-full">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <div class="relative flex items-center w-full">
      <input
        :id="id"
        class="input"
        :class="{ 'border-error focus:ring-error/10': error }"
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <div v-if="$slots.icon" class="absolute right-2 flex items-center justify-center text-text-secondary">
        <slot name="icon"></slot>
      </div>
    </div>
    <span v-if="error" class="form-error">{{ error }}</span>
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