<template>
  <div class="form-control w-full">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <div class="relative flex items-center w-full">
      <select
        :id="id"
        class="input appearance-none pr-10
               bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22%23666%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M7.247%2011.14L2.451%205.658C1.885%205.013%202.345%204%203.204%204h9.592a1%201%200%200%201%20.753%201.659l-4.796%205.48a1%201%200%200%201-1.506%200z%22%2F%3E%3C%2Fsvg%3E')]
               bg-no-repeat bg-[center_right_1rem] cursor-pointer"
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
    <span v-if="error" class="form-error">{{ error }}</span>
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