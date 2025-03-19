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
@import '../../assets/main.scss';

.login {
  min-height: 100vh;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-unit * 4;

  &__container {
    width: 100%;
    max-width: 400px;
    background: var(--color-surface);
    border-radius: $border-radius;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: $spacing-unit * 6;
  }

  &__title {
    text-align: center;
    margin-bottom: $spacing-unit * 6;
    
    h1 {
      font-size: 2rem;
      font-weight: $font-weight-semibold;
      color: var(--color-text-primary);
      margin-bottom: $spacing-unit * 2;
    }

    p {
      color: var(--color-text-secondary);
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-unit * 4;
  }

  &__error {
    margin-top: $spacing-unit * 2;
    color: var(--color-error);
    text-align: center;
  }
}
</style>