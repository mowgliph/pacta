<template>
  <div class="login">
    <div class="login__container">
      <Logo class="login__logo" />
      
      <form @submit.prevent="handleLogin" class="login__form">
        <h1>Sign In</h1>
        
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            required
            :class="{ 'error': errors.username }"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            :class="{ 'error': errors.password }"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <p v-if="error" class="login__error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Logo from '@/components/base/Logo.vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');
const credentials = ref({
  username: '',
  password: ''
});
const errors = ref({
  username: '',
  password: ''
});

async function handleLogin() {
  if (!validateForm()) return;

  loading.value = true;
  error.value = '';

  try {
    await authStore.login(credentials.value);
    router.push({ name: 'dashboard' });
  } catch (err) {
    error.value = 'Invalid username or password';
  } finally {
    loading.value = false;
  }
}

function validateForm() {
  let isValid = true;
  errors.value = {
    username: '',
    password: ''
  };

  if (!credentials.value.username) {
    errors.value.username = 'Username is required';
    isValid = false;
  }

  if (!credentials.value.password) {
    errors.value.password = 'Password is required';
    isValid = false;
  }

  return isValid;
}
</script>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-background;

  &__container {
    width: 100%;
    max-width: 400px;
    padding: $spacing-unit * 4;
  }

  &__logo {
    margin-bottom: $spacing-unit * 4;
    text-align: center;
  }

  &__form {
    background: white;
    padding: $spacing-unit * 4;
    border-radius: $border-radius;
    box-shadow: $shadow-lg;

    h1 {
      margin-bottom: $spacing-unit * 4;
      text-align: center;
      color: $color-text-primary;
    }
  }

  &__error {
    margin-top: $spacing-unit * 2;
    color: $color-error;
    text-align: center;
  }
}

.form-group {
  margin-bottom: $spacing-unit * 3;

  label {
    display: block;
    margin-bottom: $spacing-unit;
    color: $color-text-secondary;
  }

  input {
    width: 100%;
    padding: $spacing-unit * 1.5;
    border: 1px solid $color-border;
    border-radius: $border-radius;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }

    &.error {
      border-color: $color-error;
    }
  }
}

.error-message {
  display: block;
  margin-top: $spacing-unit;
  color: $color-error;
  font-size: 0.875rem;
}

.btn-primary {
  width: 100%;
  padding: $spacing-unit * 2;
  background: $color-primary;
  color: white;
  border: none;
  border-radius: $border-radius;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: darken($color-primary, 5%);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style>