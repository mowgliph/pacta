<template>
  <div class="flex flex-col gap-1 w-full">
    <label v-if="label" :for="id" class="text-sm font-medium text-text-primary">{{ label }}</label>
    <div class="relative flex items-center w-full">
      <select
        :id="id"
        class="w-full px-3 py-2 border rounded-md text-sm transition-all duration-200 bg-surface text-text-primary appearance-none pr-10
               bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23666%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M7.247%2011.14L2.451%205.658C1.885%205.013%202.345%204%203.204%204h9.592a1%201%200%200%201%20.753%201.659l-4.796%205.48a1%201%200%200%201-1.506%200z%22%2F%3E%3C%2Fsvg%3E')]
               bg-no-repeat bg-[center_right_1rem] cursor-pointer
               hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        :class="{ 'border-error focus:ring-error/10': error }"
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
    </div>
    <span v-if="error" class="text-error text-xs mt-1 transition-all">{{ error }}</span>
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