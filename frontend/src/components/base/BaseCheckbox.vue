<template>
  <label class="flex items-center relative cursor-pointer select-none gap-2">
    <span v-if="label" class="text-text-secondary text-sm pl-7">{{ label }}</span>
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="handleChange"
      class="absolute opacity-0 h-0 w-0 cursor-pointer peer"
    />
    <span class="absolute left-0 top-0 h-[18px] w-[18px] bg-surface border border-border rounded-sm transition-all duration-200 
                 after:content-[''] after:absolute after:hidden after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] 
                 after:border-white after:border-r-2 after:border-b-2 after:rotate-45
                 peer-checked:bg-primary peer-checked:border-primary peer-checked:after:block
                 peer-focus:ring-2 peer-focus:ring-primary/20
                 hover:border-primary"></span>
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