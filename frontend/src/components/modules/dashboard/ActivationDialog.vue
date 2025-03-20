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
@use '../../../styles/variables' as v;
@use '../../../styles/colors' as c;
@use '../../../styles/mixins' as m;
@use '../../../styles/typography' as t;

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin: 1.5rem 0;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  font-size: 1rem;
}

input.error {
  border-color: #EF4444;
}

.error-message {
  color: #EF4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.trial-info {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #F3F4F6;
  border-radius: 4px;
}

.trial-info ul {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-secondary {
  background: #E5E7EB;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #3B82F6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>