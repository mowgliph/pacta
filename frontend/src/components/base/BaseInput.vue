<template>
  <div class="flex flex-col gap-1 w-full">
    <label v-if="label" :for="id" class="text-sm font-medium text-text-primary">{{ label }}</label>
    <div class="relative flex items-center w-full">
      <input
        :id="id"
        class="w-full px-3 py-2 border rounded-md text-sm transition-all duration-200 bg-surface text-text-primary 
               placeholder:text-text-disabled hover:border-gray-400 
               focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        :class="{ 'border-error focus:ring-error/10': error }"
        v-bind="$attrs"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <div v-if="$slots.icon" class="absolute right-2 flex items-center justify-center text-text-secondary">
        <slot name="icon"></slot>
      </div>
    </div>
    <span v-if="error" class="text-error text-xs mt-1 transition-all">{{ error }}</span>
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