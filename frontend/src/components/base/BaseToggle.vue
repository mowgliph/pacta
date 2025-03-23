<template>
  <div class="flex items-center gap-4">
    <label v-if="label" class="text-sm font-medium text-text-primary cursor-pointer">{{ label }}</label>
    <div class="relative inline-block w-[50px] h-6">
      <input
        type="checkbox"
        :id="id"
        :checked="modelValue"
        @change="handleChange"
        class="opacity-0 w-0 h-0 peer"
      />
      <span class="absolute cursor-pointer inset-0 bg-border rounded-full transition-all duration-200
                   before:absolute before:content-[''] before:h-[18px] before:w-[18px] before:left-[3px] before:bottom-[3px] 
                   before:bg-white before:rounded-full before:transition-all before:duration-200
                   peer-checked:bg-primary
                   peer-checked:before:translate-x-[26px]
                   peer-focus:ring-2 peer-focus:ring-primary/20
                   hover:bg-gray-400"></span>
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