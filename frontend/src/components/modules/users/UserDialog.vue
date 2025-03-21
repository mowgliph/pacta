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
@use './userDialog.scss';
</style>