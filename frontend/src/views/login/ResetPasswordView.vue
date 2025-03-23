<template>
  <div class="flex min-h-screen relative bg-gradient-to-br from-primary-dark via-primary to-primary-light">
    <div class="flex-1 flex items-center justify-center p-8 animate-fade-in">
      <div class="w-full max-w-md bg-surface rounded-md shadow-lg p-8 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div class="flex items-center justify-center mb-8 animate-fade-in">
          <img src="@/assets/contract_icon.png" alt="Logo" class="w-12 h-12 mr-2 animate-pulse" />
          <h2 class="text-xl font-bold text-primary tracking-wider">PACTA</h2>
        </div>
        
        <h1 class="text-xl font-semibold text-text-primary mb-4 text-center">
          {{ token ? 'Restablecer contraseña' : 'Solicitar restablecimiento' }}
        </h1>
        
        <!-- Solicitud de recuperación -->
        <div v-if="!token">
          <p class="text-sm text-text-secondary mb-6 text-center">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
          
          <form @submit.prevent="handleForgotPassword" class="space-y-4">
            <div>
              <label for="email" class="text-sm font-medium block mb-1">Correo electrónico</label>
              <div class="relative">
                <i class="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></i>
                <input 
                  type="email" 
                  id="email" 
                  v-model="email" 
                  placeholder="Ingresa tu correo electrónico"
                  required
                  :disabled="loading"
                  class="w-full p-2 pl-10 border rounded-md text-sm transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  :class="{ 'border-error focus:ring-error/10': errors.email }"
                />
              </div>
              <span v-if="errors.email" class="text-error text-xs mt-1 block">{{ errors.email }}</span>
            </div>
            
            <div class="flex flex-col space-y-3 pt-4">
              <button 
                type="submit" 
                class="w-full bg-primary text-white py-2 rounded shadow-sm font-medium transition-all duration-200 hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-md disabled:opacity-65 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                :disabled="loading"
              >
                <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                <span>{{ loading ? 'Enviando...' : 'Enviar instrucciones' }}</span>
              </button>
              
              <router-link 
                to="/auth/login" 
                class="w-full text-center py-2 text-text-secondary text-sm hover:text-primary transition-colors"
              >
                Volver al inicio de sesión
              </router-link>
            </div>
          </form>
        </div>
        
        <!-- Restablecer contraseña -->
        <div v-else>
          <!-- Formulario de restablecimiento -->
          <div v-if="tokenVerified">
            <p class="text-sm text-text-secondary mb-6 text-center">
              Ingresa tu nueva contraseña para completar el proceso de restablecimiento.
            </p>
            
            <form @submit.prevent="handleResetPassword" class="space-y-4">
              <div>
                <label for="password" class="text-sm font-medium block mb-1">Nueva contraseña</label>
                <div class="relative">
                  <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></i>
                  <input 
                    type="password" 
                    id="password" 
                    v-model="password" 
                    placeholder="Ingresa tu nueva contraseña"
                    required
                    :disabled="loading"
                    class="w-full p-2 pl-10 border rounded-md text-sm transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    :class="{ 'border-error focus:ring-error/10': errors.password }"
                  />
                </div>
                <span v-if="errors.password" class="text-error text-xs mt-1 block">{{ errors.password }}</span>
              </div>
              
              <div>
                <label for="confirmPassword" class="text-sm font-medium block mb-1">Confirmar contraseña</label>
                <div class="relative">
                  <i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></i>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    v-model="confirmPassword" 
                    placeholder="Confirma tu nueva contraseña"
                    required
                    :disabled="loading"
                    class="w-full p-2 pl-10 border rounded-md text-sm transition-all duration-200 hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    :class="{ 'border-error focus:ring-error/10': errors.confirmPassword }"
                  />
                </div>
                <span v-if="errors.confirmPassword" class="text-error text-xs mt-1 block">{{ errors.confirmPassword }}</span>
              </div>
              
              <div class="flex flex-col space-y-3 pt-4">
                <button 
                  type="submit" 
                  class="w-full bg-primary text-white py-2 rounded shadow-sm font-medium transition-all duration-200 hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-md disabled:opacity-65 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  :disabled="loading"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                  <span>{{ loading ? 'Guardando...' : 'Guardar nueva contraseña' }}</span>
                </button>
              </div>
            </form>
          </div>
          
          <!-- Verificando token -->
          <div v-else-if="verifyingToken" class="flex flex-col items-center justify-center py-6">
            <div class="w-10 h-10 border-t-2 border-primary rounded-full animate-spin mb-4"></div>
            <p class="text-text-secondary">Verificando token...</p>
          </div>
          
          <!-- Error de token -->
          <div v-else class="text-center py-6">
            <div class="rounded-full bg-error/10 p-4 inline-flex mb-4">
              <i class="fas fa-exclamation-triangle text-2xl text-error"></i>
            </div>
            <p class="text-error font-medium mb-6">
              El enlace de restablecimiento es inválido o ha expirado.
            </p>
            <router-link 
              to="/auth/login" 
              class="inline-block bg-primary text-white py-2 px-4 rounded shadow-sm font-medium transition-all duration-200 hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-md"
            >
              Volver al inicio de sesión
            </router-link>
          </div>
        </div>
        
        <div class="text-center mt-8 text-xs text-text-disabled">
          © {{ new Date().getFullYear() }} PACTA. Todos los derechos reservados.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastNotificationStore } from '@/stores/toastNotification'

// Props
const props = defineProps<{
  token?: string
}>()

// Router y stores
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useToastNotificationStore()

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
    // Simulación de verificación de token (reemplazar con la llamada API real)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulamos que el token es válido (reemplazar con la respuesta real de la API)
    tokenVerified.value = true
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
    // Simulación de envío de email (reemplazar con la llamada API real)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mostrar mensaje de éxito
    notificationStore.success('Se han enviado instrucciones a tu correo electrónico.')
    
    // Redireccionar al login
    router.push('/auth/login')
  } catch (error) {
    console.error('Error en solicitud de restablecimiento:', error)
    notificationStore.error('Error de conexión. Intenta nuevamente.')
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
    // Simulación de restablecimiento de contraseña (reemplazar con la llamada API real)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mostrar mensaje de éxito
    notificationStore.success('Tu contraseña ha sido restablecida correctamente.')
    
    // Redireccionar al login
    router.push('/auth/login')
  } catch (error) {
    console.error('Error en restablecimiento de contraseña:', error)
    notificationStore.error('Error de conexión. Intenta nuevamente.')
  } finally {
    loading.value = false
  }
}
</script>

<style>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-pulse {
  animation: pulse 2s infinite;
}
</style> 