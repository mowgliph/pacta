<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content">
      <h2>Activate License</h2>
      
      <div class="form-group">
        <label for="licenseCode">Enter License or Trial Code</label>
        <input 
          id="licenseCode"
          v-model="code"
          type="text"
          placeholder="Enter your code"
          :class="{ 'error': hasError }"
        />
        <span v-if="hasError" class="error-message">{{ errorMessage }}</span>
      </div>

      <div class="trial-info">
        <p>Available trial codes:</p>
        <ul>
          <li>DEMOPACTA - 30 days trial</li>
          <li>TRYPACTA - 14 days trial</li>
        </ul>
      </div>

      <div class="dialog-actions">
        <button @click="handleCancel" class="btn-secondary">
          Cancel
        </button>
        <button @click="handleActivate" class="btn-primary" :disabled="!code">
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

<style lang="scss" scoped>
@use './activationDialog.scss';
</style>