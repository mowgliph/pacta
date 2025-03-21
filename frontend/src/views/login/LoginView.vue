<template>
  <div class="login" :class="{ 'dark-theme': isDark }">
        
    <div class="login__right">
      <div class="login__container">
        <div class="login__logo-container">
          <img src="@/assets/contract_icon.png" alt="Logo" class="login__logo" />
          <h2 class="login__logo-title">PACTA</h2>
        </div>
                
        <form @submit.prevent="handleLogin" class="login__form">
          <h1 class="text-center">Iniciar Sesión</h1>
          <p class="login__subtitle text-center">Ingresa tus credenciales para acceder al sistema</p>
          
          <!-- Error general -->
          <div v-if="error" class="error-alert">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
          </div>
          
          <div class="form-group">
            <label for="username">Usuario</label>
            <div class="input-wrapper">
              <i class="input-icon fas fa-user"></i>
              <input
                id="username"
                v-model="credentials.username"
                type="text"
                placeholder="Ingresa tu nombre de usuario"
                required
                :class="{ 'error': errors.username }"
                @focus="clearError('username')"
              />
            </div>
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-wrapper">
              <i class="input-icon fas fa-lock"></i>
              <input
                id="password"
                v-model="credentials.password"
                type="password"
                placeholder="Ingresa tu contraseña"
                required
                :class="{ 'error': errors.password }"
                @focus="clearError('password')"
              />
              <i 
                class="input-icon-right fas" 
                :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
                @click="togglePasswordVisibility"
              ></i>
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <div class="form-options">
            <BaseCheckbox 
              id="remember-me" 
              v-model="rememberMe" 
              label="Recordarme"
            />
          </div>

          <div class="button-container">
            <button type="submit" class="btn-primary" :disabled="loading">
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
            </button>
          </div>
        </form>
        
        <div class="login__copyright">
          {{ copyright }}
        </div>
      </div>
    </div>
    
    <!-- Nuevo contenedor para mensajes de error/advertencia -->
    <div v-if="error" class="notification notification--error">
      <i class="fas fa-exclamation-circle notification__icon"></i>
      <p class="notification__message">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/theme';
import { storeToRefs } from 'pinia';
import BaseCheckbox from '../../components/base/BaseCheckbox.vue';

// Stores
const authStore = useAuthStore();
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);
const router = useRouter();

// Estado
const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);

const credentials = ref({
  username: '',
  password: ''
});

const errors = ref({
  username: '',
  password: ''
});

// Copyright del footer
const copyright = computed(() => {
  return `© ${new Date().getFullYear()} PACTA. Todos los derechos reservados.`;
});

// Métodos
const validateForm = (): boolean => {
  let isValid = true;
  
  if (!credentials.value.username) {
    errors.value.username = 'Usuario es requerido';
    isValid = false;
  }
  
  if (!credentials.value.password) {
    errors.value.password = 'Contraseña es requerida';
    isValid = false;
  }
  
  return isValid;
};

const clearError = (field: string) => {
  if (field in errors.value) {
    errors.value[field as keyof typeof errors.value] = '';
  }
  error.value = '';
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
  const input = document.getElementById('password') as HTMLInputElement;
  if (input) {
    input.type = showPassword.value ? 'text' : 'password';
  }
};

const handleLogin = async () => {
  if (!validateForm()) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await authStore.login(
      credentials.value.username, 
      credentials.value.password,
      rememberMe.value
    );
    router.push({ name: 'dashboard' });
  } catch (err: any) {
    error.value = err.message || 'Error al iniciar sesión';
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
@use './loginView.scss';

.mr-2 {
  margin-right: 0.5rem;
}
</style>