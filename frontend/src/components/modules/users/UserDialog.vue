<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content">
      <h2>{{ user ? 'Edit User' : 'New User' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="user-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              id="username"
              v-model="formData.username"
              type="text"
              required
              :class="{ 'error': errors.username }"
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email"
              v-model="formData.email"
              type="email"
              required
              :class="{ 'error': errors.email }"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password">
              {{ user ? 'New Password (leave empty to keep current)' : 'Password' }}
            </label>
            <input 
              id="password"
              v-model="formData.password"
              type="password"
              :required="!user"
              :class="{ 'error': errors.password }"
            />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select 
              id="role"
              v-model="formData.role"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" @click="handleCancel" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn-primary">
            {{ user ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface UserFormData {
  username: string;
  email: string;
  password?: string; // Make password optional
  role: 'admin' | 'user';
}

const props = defineProps<{
  visible: boolean;
  user?: any;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'save', data: Partial<UserFormData>): void;
}>();

const formData = ref<UserFormData>({
  username: '',
  email: '',
  password: '',
  role: 'user'
});

const errors = ref({
  username: '',
  email: '',
  password: ''
});

watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      ...newUser,
      password: ''
    };
  } else {
    resetForm();
  }
}, { immediate: true });

function resetForm() {
  formData.value = {
    username: '',
    email: '',
    password: '',
    role: 'user'
  };
  errors.value = {
    username: '',
    email: '',
    password: ''
  };
}

function validateForm() {
  let isValid = true;
  errors.value = {
    username: '',
    email: '',
    password: ''
  };

  if (!formData.value.username || formData.value.username.length < 3) {
    errors.value.username = 'Username must be at least 3 characters long';
    isValid = false;
  }

  if (!formData.value.email || !formData.value.email.includes('@')) {
    errors.value.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!props.user && !formData.value.password) {
    errors.value.password = 'Password is required for new users';
    isValid = false;
  } else if (formData.value.password && formData.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters long';
    isValid = false;
  }

  return isValid;
}

function handleSubmit() {
  if (!validateForm()) return;
  
  const userData: Partial<UserFormData> = { ...formData.value };
  if (props.user && !userData.password) {
    delete userData.password;
  }
  
  emit('save', userData);
}

function handleCancel() {
  emit('update:visible', false);
  resetForm();
}
</script>

<style lang="scss" scoped>
@import '../../assets/main.scss';

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
  border-radius: $border-radius;
  padding: $spacing-unit * 4;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-unit * 3;
  margin: $spacing-unit * 3 0;
}

.form-group {
  label {
    display: block;
    margin-bottom: $spacing-unit;
    font-weight: $font-weight-medium;
  }

  input, select {
    width: 100%;
    padding: $spacing-unit * 1.5;
    border: 1px solid $color-surface;
    border-radius: $border-radius;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: $color-accent;
    }

    &.error {
      border-color: #EF4444;
    }
  }
}

.error-message {
  color: #EF4444;
  font-size: 0.875rem;
  margin-top: $spacing-unit;
  display: block;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-unit * 2;
  margin-top: $spacing-unit * 4;
}

.btn-secondary {
  padding: $spacing-unit * 1.5 $spacing-unit * 3;
  border: 1px solid $color-surface;
  background: white;
  border-radius: $border-radius;
  cursor: pointer;
  
  &:hover {
    background: $color-surface;
  }
}

.btn-primary {
  padding: $spacing-unit * 1.5 $spacing-unit * 3;
  background: $color-accent;
  color: white;
  border: none;
  border-radius: $border-radius;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
}
</style>