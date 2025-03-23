<template>
  <div class="reset-password-view">
    <h2>{{ token ? 'Restablecer contraseña' : 'Solicitar restablecimiento' }}</h2>
    
    <div v-if="!token">
      <p class="description">
        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
      </p>
      
      <form @submit.prevent="handleForgotPassword">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Ingresa tu correo electrónico"
            required
            :disabled="loading"
          />
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
          </button>
          <router-link to="/auth/login" class="btn btn-text">Volver al inicio de sesión</router-link>
        </div>
      </form>
    </div>
    
    <div v-else>
      <div v-if="tokenVerified">
        <p class="description">
          Ingresa tu nueva contraseña para completar el proceso de restablecimiento.
        </p>
        
        <form @submit.prevent="handleResetPassword">
          <div class="form-group">
            <label for="password">Nueva contraseña</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="Ingresa tu nueva contraseña"
              required
              :disabled="loading"
            />
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              placeholder="Confirma tu nueva contraseña"
              required
              :disabled="loading"
            />
            <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Guardar nueva contraseña' }}
            </button>
          </div>
        </form>
      </div>
      
      <div v-else-if="verifyingToken">
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Verificando token...</p>
        </div>
      </div>
      
      <div v-else>
        <div class="token-error">
          <p class="error-message">
            El enlace de restablecimiento es inválido o ha expirado.
          </p>
          <router-link to="/auth/login" class="btn btn-primary">Volver al inicio de sesión</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Props
const props = defineProps<{
  token?: string
}>()

// Router
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Estado
const token = computed(() => props.token || route.params.token as string)
const verifyingToken = ref(false)
const tokenVerified = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errors = ref<Record<string, string>>({})

// Verificar token al montar el componente
onMounted(async () => {
  if (token.value) {
    await verifyToken()
  }
})

// Métodos
async function verifyToken() {
  verifyingToken.value = true
  try {
    const response = await fetch('/api/v1/auth/verify-reset-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: token.value })
    })
    
    const data = await response.json()
    
    if (response.ok && data.valid) {
      tokenVerified.value = true
    } else {
      tokenVerified.value = false
    }
  } catch (error) {
    console.error('Error verificando token:', error)
    tokenVerified.value = false
  } finally {
    verifyingToken.value = false
  }
}

async function handleForgotPassword() {
  errors.value = {}
  
  // Validar email
  if (!email.value) {
    errors.value.email = 'El correo electrónico es requerido'
    return
  }
  
  loading.value = true
  
  try {
    const response = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value })
    })
    
    if (response.ok) {
      // Mostrar mensaje de éxito
      authStore.setMessage('Se han enviado instrucciones a tu correo electrónico.')
      // Redireccionar al login
      router.push('/auth/login')
    } else {
      const data = await response.json()
      if (data.errors) {
        errors.value = data.errors
      } else {
        errors.value.email = data.message || 'Error al procesar la solicitud'
      }
    }
  } catch (error) {
    console.error('Error en solicitud de restablecimiento:', error)
    errors.value.email = 'Error de conexión. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  errors.value = {}
  
  // Validar contraseñas
  if (!password.value) {
    errors.value.password = 'La contraseña es requerida'
    return
  }
  
  if (password.value.length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden'
    return
  }
  
  loading.value = true
  
  try {
    const response = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token.value,
        password: password.value
      })
    })
    
    if (response.ok) {
      // Mostrar mensaje de éxito
      authStore.setMessage('Tu contraseña ha sido restablecida correctamente.')
      // Redireccionar al login
      router.push('/auth/login')
    } else {
      const data = await response.json()
      if (data.errors) {
        errors.value = data.errors
      } else {
        errors.value.password = data.message || 'Error al restablecer la contraseña'
      }
    }
  } catch (error) {
    console.error('Error en restablecimiento de contraseña:', error)
    errors.value.password = 'Error de conexión. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as v;
@use '../../styles/colors' as c;
@use '../../styles/mixins' as m;

.reset-password-view {
  padding: v.$spacing-xl;
  
  h2 {
    margin-top: 0;
    margin-bottom: v.$spacing-lg;
    font-size: v.$font-size-xl;
    font-weight: v.$font-weight-semibold;
    color: c.$color-text-primary;
    text-align: center;
  }
  
  .description {
    text-align: center;
    margin-bottom: v.$spacing-lg;
    color: c.$color-text-secondary;
  }
  
  // Usar el mixin para los componentes de formulario
  @include m.form-components;
  
  .btn {
    padding: v.$spacing-md v.$spacing-lg;
    border: none;
    border-radius: v.$border-radius;
    font-size: v.$font-size-sm;
    font-weight: v.$font-weight-medium;
    cursor: pointer;
    transition: all v.$transition-normal;
    text-align: center;
    text-decoration: none;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  .btn-primary {
    background-color: c.$color-primary;
    color: c.$color-text-light;
    
    &:hover:not(:disabled) {
      background-color: darken(c.$color-primary, 8%);
    }
  }
  
  .btn-text {
    background: transparent;
    color: c.$color-primary;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: v.$spacing-md;
    padding: v.$spacing-xl 0;
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(c.$color-primary, 0.1);
      border-radius: 50%;
      border-top: 4px solid c.$color-primary;
      animation: spin 1s linear infinite;
    }
  }
  
  .token-error {
    text-align: center;
    padding: v.$spacing-xl 0;
    
    .error-message {
      font-size: v.$font-size-md;
      margin-bottom: v.$spacing-lg;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 