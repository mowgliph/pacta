<template>
  <div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-lg shadow-lg">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Activate License</h2>
      
      <div class="mb-6">
        <label for="licenseCode" class="block mb-2 font-medium text-gray-700 dark:text-gray-300">Enter License or Trial Code</label>
        <input 
          id="licenseCode"
          v-model="code"
          type="text"
          placeholder="Enter your code"
          class="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          :class="{ 'border-red-500 focus:ring-red-500': hasError }"
        />
        <span v-if="hasError" class="text-red-500 text-sm mt-1 block">{{ errorMessage }}</span>
      </div>

      <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-6">
        <p class="text-gray-700 dark:text-gray-300 font-medium">Available trial codes:</p>
        <ul class="ml-6 mt-2 list-disc">
          <li class="text-gray-600 dark:text-gray-400">DEMOPACTA - 30 days trial</li>
          <li class="text-gray-600 dark:text-gray-400">TRYPACTA - 14 days trial</li>
        </ul>
      </div>

      <div class="flex justify-end gap-4 mt-8">
        <button 
          @click="handleCancel" 
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleActivate" 
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!code"
        >
          Activate
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  visible: boolean
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'activate', code: string): void
}>();

const code = ref('');
const hasError = ref(false);
const errorMessage = ref('');

watch(() => props.visible, (newValue) => {
  if (!newValue) {
    code.value = '';
    hasError.value = false;
    errorMessage.value = '';
  }
});

const handleCancel = () => {
  emit('update:visible', false);
};

const handleActivate = () => {
  if (!code.value) {
    hasError.value = true;
    errorMessage.value = 'Please enter a license code';
    return;
  }
  
  emit('activate', code.value);
};
</script>