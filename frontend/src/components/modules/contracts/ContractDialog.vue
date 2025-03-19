<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content">
      <h2>{{ contract ? 'Edit Contract' : 'New Contract' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="contract-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="title">Title</label>
            <input 
              id="title"
              v-model="formData.title"
              type="text"
              required
              :class="{ 'error': errors.title }"
            />
            <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
          </div>

          <div class="form-group">
            <label for="contractNumber">Contract Number</label>
            <input 
              id="contractNumber"
              v-model="formData.contractNumber"
              type="text"
              required
              :class="{ 'error': errors.contractNumber }"
            />
            <span v-if="errors.contractNumber" class="error-message">
              {{ errors.contractNumber }}
            </span>
          </div>

          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input 
              id="startDate"
              v-model="formData.startDate"
              type="date"
              required
              :class="{ 'error': errors.startDate }"
            />
            <span v-if="errors.startDate" class="error-message">{{ errors.startDate }}</span>
          </div>

          <div class="form-group">
            <label for="endDate">End Date</label>
            <input 
              id="endDate"
              v-model="formData.endDate"
              type="date"
              required
              :min="formData.startDate"
              :class="{ 'error': errors.endDate }"
            />
            <span v-if="errors.endDate" class="error-message">{{ errors.endDate }}</span>
          </div>

          <div class="form-group">
            <label for="amount">Amount</label>
            <input 
              id="amount"
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              required
              :class="{ 'error': errors.amount }"
            />
            <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
          </div>

          <div class="form-group">
            <label for="currency">Currency</label>
            <select 
              id="currency"
              v-model="formData.currency"
              required
            >
              <option value="CUP">CUP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div class="form-group">
            <label for="notificationDays">Notification Days</label>
            <input 
              id="notificationDays"
              v-model.number="formData.notificationDays"
              type="number"
              min="1"
              max="90"
              required
            />
          </div>

          <div class="form-group full-width">
            <label for="description">Description</label>
            <textarea 
              id="description"
              v-model="formData.description"
              rows="4"
              :class="{ 'error': errors.description }"
            ></textarea>
            <span v-if="errors.description" class="error-message">
              {{ errors.description }}
            </span>
          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" @click="handleCancel" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn-primary">
            {{ contract ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  visible: boolean;
  contract?: any;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: any): void;
}>();

const formData = ref({
  title: '',
  contractNumber: '',
  description: '',
  startDate: '',
  endDate: '',
  amount: 0,
  currency: 'CUP',
  notificationDays: 30
});

const errors = ref({
  title: '',
  contractNumber: '',
  description: '',
  startDate: '',
  endDate: '',
  amount: ''
});

watch(() => props.contract, (newContract) => {
  if (newContract) {
    Object.assign(formData.value, {
      ...newContract,
      startDate: formatDateForInput(newContract.startDate),
      endDate: formatDateForInput(newContract.endDate)
    });
  } else {
    resetForm();
  }
}, { immediate: true });

function formatDateForInput(date: string) {
  return new Date(date).toISOString().split('T')[0];
}

function resetForm() {
  formData.value = {
    title: '',
    contractNumber: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: 0,
    currency: 'CUP',
    notificationDays: 30
  };
  errors.value = {
    title: '',
    contractNumber: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: ''
  };
}

function validateForm() {
  let isValid = true;
  errors.value = {
    title: '',
    contractNumber: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: ''
  };

  if (!formData.value.title || formData.value.title.length < 3) {
    errors.value.title = 'Title must be at least 3 characters long';
    isValid = false;
  }

  if (!formData.value.contractNumber) {
    errors.value.contractNumber = 'Contract number is required';
    isValid = false;
  }

  if (formData.value.description && formData.value.description.length > 1000) {
    errors.value.description = 'Description must not exceed 1000 characters';
    isValid = false;
  }

  if (new Date(formData.value.endDate) <= new Date(formData.value.startDate)) {
    errors.value.endDate = 'End date must be after start date';
    isValid = false;
  }

  if (formData.value.amount <= 0) {
    errors.value.amount = 'Amount must be greater than 0';
    isValid = false;
  }

  return isValid;
}

function handleSubmit() {
  if (!validateForm()) return;
  
  emit('save', { ...formData.value });
}

function handleCancel() {
  emit('update:visible', false);
  resetForm();
}
</script>

<style lang="scss" scoped>

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
  border-radius: v.$border-radius;
  padding: v.$spacing-unit * 4;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: v.$spacing-unit * 3;
  margin: v.$spacing-unit * 3 0;
}

.form-group {
  &.full-width {
    grid-column: 1 / -1;
  }

  label {
    display: block;
    margin-bottom: v.$spacing-unit;
    font-weight: v.$font-weight-medium;
  }

  input, select, textarea {
    width: 100%;
    padding: v.$spacing-unit * 1.5;
    border: 1px solid c.$color-surface;
    border-radius: v.$border-radius;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: c.$color-accent;
    }

    &.error {
      border-color: #EF4444;
    }
  }

  textarea {
    resize: vertical;
  }
}

.error-message {
  color: #EF4444;
  font-size: 0.875rem;
  margin-top: v.$spacing-unit;
  display: block;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: v.$spacing-unit * 2;
  margin-top: v.$spacing-unit * 4;
}

.btn-secondary {
  padding: v.$spacing-unit * 1.5 v.$spacing-unit * 3;
  border: 1px solid c.$color-surface;
  background: white;
  border-radius: v.$border-radius;
  cursor: pointer;
  
  &:hover {
    background: c.$color-surface;
  }
}

.btn-primary {
  padding: v.$spacing-unit * 1.5 v.$spacing-unit * 3;
  background: c.$color-accent;
  color: white;
  border: none;
  border-radius: v.$border-radius;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
}
</style>