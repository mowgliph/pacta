<template>
  <div class="login">
        
    <div class="login__right">
      <div class="login__container">
                
        <form @submit.prevent="handleLogin" class="login__form">
          <h1>Iniciar Sesión</h1>
          <p class="login__subtitle">Ingresa tus credenciales para acceder al sistema</p>
          
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
              />
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>
        
        <div class="login__copyright">
          © 2024 PACTA. Todos los derechos reservados.
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

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
    console.log('Attempting login with:', credentials.value);
    const success = await authStore.login(
      credentials.value.username,
      credentials.value.password
    );
    console.log('Login response:', success);
    console.log('Auth store errors:', authStore.errors);
    
    if (success) {
      console.log('Login successful, checking license status');
      // Si el login es exitoso, el router se encargará de redirigir
      // a la página de licencia si es necesario
      const redirectPath = router.currentRoute.value.query.redirect as string || '/dashboard';
      router.push(redirectPath);
    } else {
      console.log('Login failed, showing error');
      error.value = authStore.errors[0] || 'Credenciales inválidas';
    }
  } catch (err: any) {
    console.error('Login error:', err);
    if (!err.response) {
      error.value = 'Error de conexión. Por favor, verifica tu conexión a internet e intente nuevamente.';
    } else {
      console.log('Error response:', err.response);
      switch (err.response.status) {
        case 401:
          error.value = 'Credenciales inválidas';
          break;
        case 403:
          error.value = 'No tienes permisos para acceder al sistema';
          break;
        case 404:
          error.value = 'El usuario no existe en el sistema';
          break;
        case 423:
          error.value = 'Tu cuenta ha sido bloqueada temporalmente. Por favor, intenta más tarde';
          break;
        case 503:
          error.value = 'El servicio no está disponible en este momento. Por favor, intente más tarde';
          break;
        default:
          error.value = err.response.data?.message || 'Error al iniciar sesión. Por favor, intente nuevamente';
      }
    }
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
    errors.value.username = 'El usuario es obligatorio';
    isValid = false;
  }

  if (!credentials.value.password) {
    errors.value.password = 'La contraseña es obligatoria';
    isValid = false;
  }

  return isValid;
}
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;
@use '../styles/typography' as t;

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.login {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, c.$color-surface, c.$color-background);
  position: relative;
  
  &__right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: v.$spacing-unit * 4;
    animation: fadeIn 1s ease-out;
  }
  
  &__branding {
    position: relative;
    z-index: 1;
    text-align: center;
    color: white;
    
    h2 {
      font-size: 3rem;
      font-weight: v.$font-weight-bold;
      margin-bottom: v.$spacing-unit * 2;
      letter-spacing: 2px;
      animation: slideIn 0.6s ease-out;
    }
    
    p {
      font-size: 1.5rem;
      font-weight: v.$font-weight-medium;
      margin-bottom: v.$spacing-unit * 6;
      animation: slideIn 0.8s ease-out;
    }
  }
  
  &__tagline {
    margin-top: v.$spacing-unit * 8;
    padding: v.$spacing-unit * 4;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    font-style: italic;
    animation: slideIn 1s ease-out;
    
    p {
      font-size: 1.25rem;
      font-weight: v.$font-weight-light;
    }
  }

  &__container {
    width: 100%;
    max-width: 450px;
    background: white;
    border-radius: v.$border-radius-lg;
    box-shadow: v.$shadow-lg;
    padding: v.$spacing-unit * 8;
    position: relative;
    animation: fadeIn 1.2s ease-out;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: v.$shadow-lg, 0 12px 28px rgba(0, 0, 0, 0.1);
    }
  }
  
  &__logo {
    display: block;
    margin: 0 auto v.$spacing-unit * 6;
    width: 80px;
    height: auto;
    animation: fadeIn 1.4s ease-out;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: v.$spacing-unit * 6;
    
    h1 {
      font-size: 2rem;
      font-weight: v.$font-weight-bold;
      color: c.$color-text-primary;
      margin-bottom: v.$spacing-unit;
      text-align: center;
    }
  }
  
  &__subtitle {
    text-align: center;
    color: c.$color-text-secondary;
    margin-bottom: v.$spacing-unit * 4;
  }

  &__error {
    margin-top: v.$spacing-unit * 2;
    color: c.$color-error;
    text-align: center;
    font-size: v.$font-size-sm;
  }
  
  &__copyright {
    @include m.copyright;
    margin-top: v.$spacing-unit * 6;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: v.$spacing-unit * 2;
  
  label {
    font-weight: v.$font-weight-medium;
    color: c.$color-text-primary;
    font-size: v.$font-size-sm;
  }
}

.input-wrapper {
  position: relative;
  
  .input-icon {
    position: absolute;
    left: v.$spacing-unit * 3;
    top: 50%;
    transform: translateY(-50%);
    color: c.$color-text-secondary;
  }
  
  input {
    width: 100%;
    padding: v.$spacing-unit * 4 v.$spacing-unit * 4 v.$spacing-unit * 4 v.$spacing-unit * 10;
    border: 1px solid c.$color-border;
    border-radius: v.$border-radius-md;
    font-size: v.$font-size-md;
    transition: all v.$transition-normal;
    
    &:focus {
      outline: none;
      border-color: c.$color-accent;
      box-shadow: 0 0 0 3px rgba(c.$color-accent, 0.1);
    }
    
    &.error {
      border-color: c.$color-error;
      box-shadow: 0 0 0 3px rgba(c.$color-error, 0.1);
    }
    
    &::placeholder {
      color: color.adjust(c.$color-text-secondary, $lightness: 20%);
    }
  }
}

.error-message {
  color: c.$color-error;
  font-size: v.$font-size-xs;
  margin-top: v.$spacing-unit;
}

.btn-primary {
  background: linear-gradient(to right, c.$color-accent, c.$color-primary);
  color: white;
  padding: v.$spacing-unit * 4;
  border: none;
  border-radius: v.$border-radius-md;
  font-size: v.$font-size-md;
  font-weight: v.$font-weight-semibold;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

@media (max-width: 1024px) {
  .login {
    flex-direction: column;
    
    &__left, &__right {
      flex: none;
      width: 100%;
    }
    
    &__left {
      padding: v.$spacing-unit * 6 v.$spacing-unit * 4;
    }
    
    &__right {
      padding: v.$spacing-unit * 8 v.$spacing-unit * 4;
    }
    
    &__container {
      padding: v.$spacing-unit * 6;
    }
  }
}

// Nuevos estilos para notificaciones
.notification {
  position: fixed;
  bottom: v.$spacing-unit * 6;
  left: v.$spacing-unit * 6;
  display: flex;
  align-items: center;
  padding: v.$spacing-unit * 3 v.$spacing-unit * 4;
  border-radius: v.$border-radius-md;
  box-shadow: v.$shadow-md;
  max-width: 350px;
  animation: slideInUp 0.3s ease-out forwards;
  z-index: 1000;
  
  &__icon {
    font-size: 1.25rem;
    margin-right: v.$spacing-unit * 3;
  }
  
  &__message {
    font-size: v.$font-size-sm;
    font-weight: v.$font-weight-medium;
    margin: 0;
  }
  
  &--error {
    background-color: rgba(c.$color-error, 0.1);
    border-left: 4px solid c.$color-error;
    color: color.adjust(c.$color-error, $lightness: -10%);
    
    .notification__icon {
      color: c.$color-error;
    }
  }
  
  &--warning {
    background-color: rgba(c.$color-warning, 0.1);
    border-left: 4px solid c.$color-warning;
    color: color.adjust(c.$color-warning, $lightness: -10%);
    
    .notification__icon {
      color: c.$color-warning;
    }
  }
  
  &--info {
    background-color: rgba(c.$color-info, 0.1);
    border-left: 4px solid c.$color-info;
    color: color.adjust(c.$color-info, $lightness: -10%);
    
    .notification__icon {
      color: c.$color-info;
    }
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>