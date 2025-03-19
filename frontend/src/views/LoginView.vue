<template>
  <div class="login">
    <div class="login__left">
      <div class="login__branding">
        <h2>PACTA</h2>
        <p>Gestión de Contratos</p>
        <div class="login__tagline">
          <p>"Tus contratos, al alcance de un clic."</p>
        </div>
      </div>
    </div>
    
    <div class="login__right">
      <div class="login__container">
        <Logo class="login__logo" />
        
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

          <p v-if="error" class="login__error">{{ error }}</p>
        </form>
        
        <div class="login__copyright">
          © 2024 PACTA. Desarrollado por mowDev. Todos los derechos reservados.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Logo from '../components/base/Logo.vue';

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
    error.value = 'Usuario o contraseña incorrectos';
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
@use '../assets/styles/_variables.scss' as v;
@use '../assets/styles/_colors.scss' as c;
@use '../assets/styles/_mixins.scss' as m;

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
  
  &__left {
    flex: 1;
    background: linear-gradient(135deg, c.$color-primary, c.$color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: v.$spacing-unit * 8;
    position: relative;
    overflow: hidden;
    animation: fadeIn 0.8s ease-out;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                         radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 2px, transparent 2px),
                         radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px);
      background-size: 40px 40px, 60px 60px, 30px 30px;
      opacity: 0.4;
    }
  }
  
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
      color: lighten(c.$color-text-secondary, 20%);
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
</style>