<template>
  <div class="flex min-h-screen relative bg-gradient-to-br from-primary-dark via-primary to-primary-light" :class="{ 'dark-theme': isDark }">
    <div class="flex-1 flex items-center justify-center p-8 animate-[fade-in_0.8s_ease-in-out]">
      <div class="w-full max-w-md bg-surface rounded-md shadow-lg p-8 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div class="flex items-center justify-center mb-8 animate-[fade-in_0.8s_ease-in-out]">
          <img src="@/assets/contract_icon.png" alt="Logo" class="w-12 h-12 mr-2 animate-[pulse_2s_infinite]" />
          <h2 class="text-xl font-bold text-primary tracking-wider">PACTA</h2>
        </div>
                
        <form @submit.prevent="handleLogin" class="w-full">
          <h1 class="text-xl font-semibold text-text-primary mb-4 text-center">Iniciar Sesión</h1>
          <p class="text-sm text-text-secondary mb-8 text-center">Ingresa tus credenciales para acceder al sistema</p>
          
          <div class="form-control">
            <label for="username" class="form-label">Usuario</label>
            <div class="relative">
              <i class="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></i>
              <input
                id="username"
                v-model="credentials.username"
                type="text"
                placeholder="Ingresa tu nombre de usuario"
                required
                class="input pl-10"
                :class="{ 'border-error focus:ring-error/10': errors.username }"
                @focus="clearError('username')"
              />
            </div>
            <span v-if="errors.username" class="form-error">{{ errors.username }}</span>
          </div>

          <div class="form-control">
            <label for="password" class="form-label">Contraseña</label>
            <div class="relative">
              <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></i>
              <input
                id="password"
                v-model="credentials.password"
                type="password"
                placeholder="Ingresa tu contraseña"
                required
                class="input pl-10"
                :class="{ 'border-error focus:ring-error/10': errors.password }"
                @focus="clearError('password')"
              />
              <i 
                class="fas absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary cursor-pointer hover:text-primary transition-colors duration-200" 
                :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
                @click="togglePasswordVisibility"
              ></i>
            </div>
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <div class="flex justify-between items-center my-4">
            <BaseCheckbox 
              id="remember-me" 
              v-model="rememberMe" 
              label="Recordarme"
            />
          </div>

          <div class="mt-6">
            <button 
              type="submit" 
              class="btn btn-primary w-full"
              :disabled="loading"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
            </button>
          </div>
        </form>
        
        <div class="text-center mt-8 text-xs text-text-disabled">
          {{ copyright }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useThemeStore } from '../../stores/theme';
import { useToastNotificationStore } from '../../stores/toastNotification';
import { storeToRefs } from 'pinia';
import BaseCheckbox from '../../components/base/BaseCheckbox.vue';

// Stores
const authStore = useAuthStore();
const themeStore = useThemeStore();
const notificationStore = useToastNotificationStore();
const { isDark } = storeToRefs(themeStore);
const router = useRouter();

// Estado
const loading = ref(false);
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
  
  try {
    await authStore.login(
      credentials.value.username, 
      credentials.value.password,
      rememberMe.value
    );
    notificationStore.success('¡Bienvenido! Sesión iniciada correctamente.');
    router.push({ name: 'dashboard' });
  } catch (err: any) {
    notificationStore.error(err.message || 'Error al iniciar sesión');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleForgotPassword = () => {
  router.push('/auth/reset-password');
};
</script>

<style>
/* El componente ahora usa animaciones de Tailwind directamente */
</style>