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

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;

.login {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, c.$color-primary-dark 0%, c.$color-primary 65%, c.$color-primary-light 100%);
  position: relative;
  
  &__right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: v.$spacing-xl;
    animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &__container {
    width: 100%;
    max-width: 450px;
    background: c.$color-surface;
    border-radius: v.$border-radius-md;
    box-shadow: v.$shadow-lg;
    padding: v.$spacing-xxl;
    position: relative;
    animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px rgba(c.$color-primary-dark, 0.15);
    }
  }
  
  &__logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: v.$spacing-xl;
    animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &__logo {
    width: 48px;
    height: 48px;
    margin-right: v.$spacing-sm;
    animation: pulse 2s infinite;
  }
  
  &__logo-title {
    font-size: v.$font-size-xl;
    font-weight: v.$font-weight-bold;
    color: c.$color-primary;
    letter-spacing: 1px;
  }
  
  &__form {
    h1 {
      color: c.$color-text-primary;
      margin-bottom: v.$spacing-md;
      font-weight: v.$font-weight-semibold;
      font-size: v.$font-size-xl;
    }
    
    // Aplicamos el mixin de componentes de formulario
    @include m.form-components;
    
    .input-wrapper {
      position: relative;
      
      .input-icon {
        position: absolute;
        left: v.$spacing-md;
        top: 50%;
        transform: translateY(-50%);
        color: c.$color-text-secondary;
      }
      
      .input-icon-right {
        position: absolute;
        right: v.$spacing-md;
        top: 50%;
        transform: translateY(-50%);
        color: c.$color-text-secondary;
        cursor: pointer;
        transition: v.$transition-normal;
        
        &:hover {
          color: c.$color-primary;
        }
      }
    }
    
    input {
      padding-left: v.$spacing-xl !important;
    }
  }
  
  &__subtitle {
    color: c.$color-text-secondary;
    margin-bottom: v.$spacing-xl;
    font-size: v.$font-size-sm;
  }
  
  &__copyright {
    text-align: center;
    margin-top: v.$spacing-xl;
    color: c.$color-text-disabled;
    font-size: v.$font-size-xs;
    width: 100%;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: v.$spacing-md 0;
}

.button-container {
  margin-top: v.$spacing-lg;
}

.btn-primary {
  @include m.button-theme('primary');
  width: 100%;
  padding: v.$spacing-md;
  font-weight: v.$font-weight-medium;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    margin-right: v.$spacing-xs;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.text-center {
  text-align: center;
}
</style>