<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Encabezado de la página -->
    <div class="mb-8 border-b border-border pb-4">
      <h1 class="text-2xl font-semibold text-text-primary">Configuración del Sistema</h1>
    </div>

    <!-- Configuración General -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-medium text-text-primary">Configuración General</h2>
        <button class="btn-primary inline-flex items-center gap-2">
          <i class="fas fa-save"></i>
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Información de la Empresa -->
        <div class="card">
          <h3 class="text-lg font-medium mb-4 text-text-primary">Información de la Empresa</h3>
          <div class="form-control">
            <label class="form-label">Nombre de la Empresa</label>
            <input type="text" v-model="companyName" placeholder="Ingrese el nombre de la empresa" 
                  class="input" />
          </div>
          <div class="form-control">
            <label class="form-label">Dirección</label>
            <input type="text" v-model="companyAddress" placeholder="Ingrese la dirección" 
                  class="input" />
          </div>
        </div>

        <!-- Configuración de Notificaciones -->
        <div class="card">
          <h3 class="text-lg font-medium mb-4 text-text-primary">Configuración de Notificaciones</h3>
          <div class="form-control">
            <label class="form-label">Días de Anticipación para Alertas</label>
            <input type="number" v-model="notificationDays" min="1" max="90" 
                  class="input" />
          </div>
          <div class="form-control">
            <label class="form-label">Correo Electrónico para Notificaciones</label>
            <input type="email" v-model="notificationEmail" placeholder="ejemplo@empresa.com" 
                  class="input" />
          </div>
        </div>

        <!-- Configuración de Licencia -->
        <div class="card">
          <h3 class="text-lg font-medium mb-4 text-text-primary">Configuración de Licencia</h3>
          
          <!-- Estado actual de la licencia -->
          <div v-if="license" class="mb-4">
            <div class="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full text-sm font-medium"
                 :class="license.type === 'Licencia Activa' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'">
              <i class="fas fa-shield-alt"></i>
              <span>{{ license.type }}</span>
            </div>
            <p class="mb-1 text-sm"><span class="font-medium">Tipo:</span> {{ license.type }}</p>
            <p class="mb-1 text-sm"><span class="font-medium">Vencimiento:</span> {{ license.expiration_date }}</p>
            <p class="mb-1 text-sm"><span class="font-medium">Días restantes:</span> {{ calculateRemainingDays(license.expiration_date) }}</p>
          </div>
          
          <div v-else class="mb-4 p-3 rounded bg-background">
            <div class="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Sistema funcionando sin licencia</span>
            </div>
            <p class="text-sm text-text-secondary">El sistema está operando sin una licencia activada. Algunas funcionalidades como la gestión de usuarios y contratos están deshabilitadas.</p>
          </div>
          
          <!-- Mensaje de error -->
          <div v-if="errorMessage" class="mb-4 p-3 rounded bg-error/10 text-error text-sm">
            {{ errorMessage }}
          </div>
          
          <!-- Activación por código promocional -->
          <div class="form-control mt-4">
            <label class="form-label">Código Promocional</label>
            <div class="flex gap-2">
              <input type="text" v-model="licenseCode" placeholder="Ingrese código promocional (ej: DEMOPACTA)" 
                    class="input" />
              <button class="btn-primary inline-flex items-center" @click="activateLicense" 
                      :disabled="!licenseCode.trim() || loading">
                <i v-if="!loading" class="fas fa-check mr-2"></i>
                <i v-else class="fas fa-spinner fa-spin mr-2"></i>
                <span>Activar</span>
              </button>
            </div>
            <small class="text-xs text-text-secondary mt-1 block">Use códigos como DEMOPACTA o TRYPACTA</small>
          </div>
          
          <!-- Activación por archivo -->
          <div class="form-control mt-4">
            <label class="form-label">Archivo de Licencia</label>
            <div class="border-2 border-dashed border-border rounded-md p-4 cursor-pointer transition-all duration-200 hover:border-primary hover:bg-primary/5" 
                 @drop.prevent="handleFileDrop"
                 @dragover.prevent
                 @dragenter.prevent
                 @click="handleOpenFileInput">
              <input 
                type="file" 
                ref="fileInput"
                class="hidden"
                accept=".lic"
                @change="handleFileSelect"
              />
              <div class="text-center">
                <i class="fas fa-cloud-upload-alt text-2xl text-text-secondary mb-2"></i>
                <p class="text-text-secondary">Arrastra y suelta un archivo .lic o haz clic para seleccionarlo</p>
              </div>
            </div>
            
            <div v-if="selectedFile" class="flex items-center justify-between p-2 mt-2 bg-primary/10 rounded-md">
              <span class="text-sm text-text-primary">{{ selectedFile.name }}</span>
              <button @click.stop="removeFile" class="p-1 text-text-secondary hover:text-error transition-colors">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <button v-if="selectedFile" class="btn-primary mt-2 w-full" @click="uploadLicenseFile" :disabled="loading">
              <i class="fas fa-upload mr-2" v-if="!loading"></i>
              <i class="fas fa-spinner fa-spin mr-2" v-else></i>
              Subir y Activar Licencia
            </button>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-medium mb-4 text-text-primary">Preferencias de Interfaz</h3>
          <div class="form-control">
            <label class="form-label">Tema de la Aplicación</label>
            <select 
              v-model="selectedTheme" 
              class="input"
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
          <div class="form-control">
            <label class="form-label">Idioma</label>
            <select v-model="language" class="input">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuración del Usuario -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-medium text-text-primary">Configuración del Usuario</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Perfil -->
        <div class="card">
          <h3 class="text-lg font-medium mb-4 text-text-primary">Perfil</h3>
          <div class="flex flex-col mb-6">
            <div class="flex justify-center mb-4">
              <div class="relative">
                <div class="h-24 w-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  <img v-if="userAvatar" :src="userAvatar" class="h-full w-full object-cover" alt="Avatar de usuario" />
                  <i v-else class="fas fa-user text-3xl text-gray-400"></i>
                </div>
                <button class="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-md">
                  <i class="fas fa-camera text-sm"></i>
                </button>
              </div>
            </div>
            
            <div class="text-center">
              <h4 class="font-medium text-text-primary">{{ userName }}</h4>
              <p class="text-sm text-text-secondary">{{ userEmail }}</p>
              <p class="text-sm text-text-secondary">{{ userRole }}</p>
            </div>
          </div>
          
          <div class="form-control">
            <label class="form-label">Nombre</label>
            <input type="text" v-model="userName" class="input" />
          </div>
          
          <div class="form-control">
            <label class="form-label">Email</label>
            <input type="email" v-model="userEmail" class="input" disabled />
          </div>
        </div>

        <!-- Seguridad -->
        <div class="card">
          <h3 class="text-lg font-medium mb-4 text-text-primary">Seguridad</h3>
          
          <div class="form-control">
            <label class="form-label">Contraseña Actual</label>
            <input type="password" v-model="currentPassword" placeholder="Ingrese su contraseña actual" class="input" />
          </div>
          
          <div class="form-control">
            <label class="form-label">Nueva Contraseña</label>
            <input type="password" v-model="newPassword" placeholder="Ingrese nueva contraseña" class="input" />
            
            <div class="mt-2">
              <div class="flex items-center text-xs">
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div class="bg-primary h-1.5 rounded-full" :style="{ width: passwordStrength + '%' }"></div>
                </div>
                <span class="ml-2 text-text-secondary">{{ passwordStrengthText }}</span>
              </div>
              
              <ul class="mt-2 space-y-1 text-xs text-text-secondary">
                <li class="flex items-center">
                  <i :class="hasMinLength ? 'text-success' : 'text-text-secondary'" class="fas fa-check-circle mr-2"></i>
                  Al menos 8 caracteres
                </li>
                <li class="flex items-center">
                  <i :class="hasUppercase ? 'text-success' : 'text-text-secondary'" class="fas fa-check-circle mr-2"></i>
                  Al menos una mayúscula
                </li>
                <li class="flex items-center">
                  <i :class="hasNumber ? 'text-success' : 'text-text-secondary'" class="fas fa-check-circle mr-2"></i>
                  Al menos un número
                </li>
                <li class="flex items-center">
                  <i :class="hasSpecialChar ? 'text-success' : 'text-text-secondary'" class="fas fa-check-circle mr-2"></i>
                  Al menos un carácter especial
                </li>
              </ul>
            </div>
          </div>
          
          <div class="form-control">
            <label class="form-label">Confirmar Nueva Contraseña</label>
            <input type="password" v-model="confirmPassword" placeholder="Confirme nueva contraseña" class="input" />
            <p v-if="passwordsDoNotMatch" class="text-error text-xs mt-1">Las contraseñas no coinciden</p>
          </div>
          
          <button class="btn-primary w-full mt-4" :disabled="!canChangePassword || loading">
            <i v-if="!loading" class="fas fa-key mr-2"></i>
            <i v-else class="fas fa-spinner fa-spin mr-2"></i>
            Cambiar Contraseña
          </button>
        </div>

        <!-- Preferencias -->
        <div class="card">
          <h3 class="text-lg font-medium mb-4 text-text-primary">Preferencias</h3>
          
          <div class="space-y-4">
            <div class="form-control">
              <label class="form-label">Modo de Notificación</label>
              <select v-model="notificationPreference" class="input">
                <option value="all">Todas las notificaciones</option>
                <option value="important">Solo importantes</option>
                <option value="none">Ninguna</option>
              </select>
            </div>
            
            <div>
              <h4 class="text-sm font-medium mb-2 text-text-primary">Notificaciones Push</h4>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="notifyNewTask" class="checkbox" />
                  <span class="text-sm">Nuevas tareas asignadas</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="notifyTaskComment" class="checkbox" />
                  <span class="text-sm">Comentarios en mis tareas</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="notifyDeadline" class="checkbox" />
                  <span class="text-sm">Recordatorios de plazos</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 class="text-sm font-medium mb-2 text-text-primary">Notificaciones por Email</h4>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="emailNewTask" class="checkbox" />
                  <span class="text-sm">Nuevas tareas asignadas</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="emailSummary" class="checkbox" />
                  <span class="text-sm">Resumen diario de actividades</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="emailDeadline" class="checkbox" />
                  <span class="text-sm">Alertas de vencimiento</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección Avanzada -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-medium text-text-primary">Configuración Avanzada</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Conexiones API -->
        <div class="card">
          <h3 class="text-lg font-medium mb-4 text-text-primary">Conexiones API</h3>
          
          <div v-if="apiKeys.length > 0" class="mb-4">
            <div v-for="(key, index) in apiKeys" :key="index" class="border border-border rounded-md p-3 mb-3">
              <div class="flex justify-between items-center">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-text-primary">{{ key.name }}</span>
                    <span :class="key.active ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
                          class="text-xs rounded-full px-2 py-0.5">
                      {{ key.active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </div>
                  <div class="text-xs text-text-secondary mt-1">
                    Creada: {{ key.created }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <button class="text-lg p-1 rounded hover:bg-background transition-colors" @click="toggleApiKey(index)">
                    <i class="fas" :class="key.active ? 'fa-toggle-on text-success' : 'fa-toggle-off text-text-secondary'"></i>
                  </button>
                  <button class="text-lg p-1 rounded hover:bg-background transition-colors" @click="deleteApiKey(index)">
                    <i class="fas fa-trash text-error"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="flex flex-col items-center justify-center py-6 text-center">
            <div class="rounded-full bg-gray-100 p-4 mb-4">
              <i class="fas fa-key text-xl text-gray-400"></i>
            </div>
            <p class="text-text-secondary mb-2">No hay claves API configuradas</p>
            <p class="text-xs text-text-secondary mb-4">Cree una nueva clave API para integrar con servicios externos</p>
          </div>
          
          <button class="btn-primary w-full flex items-center justify-center" @click="createNewApiKey">
            <i class="fas fa-plus mr-2"></i>
            Crear Nueva Clave API
          </button>
        </div>

        <!-- Importación y Exportación -->
        <div class="card">
          <h3 class="text-lg font-medium mb-4 text-text-primary">Importación y Exportación</h3>
          
          <div class="mb-4">
            <h4 class="text-sm font-medium mb-2 text-text-primary">Exportar Datos</h4>
            <p class="text-xs text-text-secondary mb-3">
              Exporte todos los datos de la aplicación a un archivo JSON para backup
            </p>
            <button class="btn-outline w-full flex items-center justify-center gap-2">
              <i class="fas fa-download"></i>
              <span>Exportar Datos</span>
            </button>
          </div>
          
          <div class="mb-4">
            <h4 class="text-sm font-medium mb-2 text-text-primary">Importar Datos</h4>
            <p class="text-xs text-text-secondary mb-3">
              Importe datos desde un archivo JSON previamente exportado
            </p>
            <div class="border-2 border-dashed border-border rounded-md p-4 text-center">
              <i class="fas fa-upload text-xl text-text-secondary mb-2"></i>
              <p class="text-sm text-text-secondary mb-2">Arrastra y suelta un archivo o</p>
              <button class="btn-secondary">Seleccionar archivo</button>
            </div>
          </div>
          
          <div>
            <h4 class="text-sm font-medium mb-2 text-text-primary">Eliminar Todos los Datos</h4>
            <p class="text-xs text-text-secondary mb-3">
              ¡Advertencia! Esta acción eliminará permanentemente todos los datos del sistema
            </p>
            <button class="bg-error hover:bg-error/90 text-white rounded-md py-2 px-4 w-full flex items-center justify-center gap-2 transition-colors">
              <i class="fas fa-trash-alt"></i>
              <span>Eliminar Todos los Datos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { authService } from '../../services/auth.service'
import { userService } from '../../services/user.service'
import { useThemeStore } from '../../stores/theme'
import type { User } from '@/types/api'

// Stores
const authStore = useAuthStore()
const themeStore = useThemeStore()

// Configuración General
const companyName = ref('')
const companyAddress = ref('')
const notificationDays = ref(30)
const notificationEmail = ref('')
const licenseCode = ref('')
const selectedTheme = ref(themeStore.isDark ? 'dark' : 'light')
const language = ref('es')

// Observar cambios en el tema
watch(() => selectedTheme.value, (newValue) => {
  themeStore.setDarkTheme(newValue === 'dark')
})

// Licencia
const license = ref(authStore.license)
const loading = ref(false)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

// Perfil de usuario
const userAvatar = ref(null)
const userName = ref('Admin User')
const userEmail = ref('admin@pacta.com')
const userRole = ref('Administrador')

// Seguridad
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const hasMinLength = ref(false)
const hasUppercase = ref(false)
const hasNumber = ref(false)
const hasSpecialChar = ref(false)
const passwordStrength = ref(0)
const passwordStrengthText = computed(() => {
  if (passwordStrength.value < 30) return 'Débil'
  if (passwordStrength.value < 60) return 'Media'
  if (passwordStrength.value < 80) return 'Buena'
  return 'Fuerte'
})
const passwordsDoNotMatch = computed(() => {
  return newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value
})
const canChangePassword = computed(() => {
  return (
    currentPassword.value && 
    newPassword.value && 
    confirmPassword.value && 
    newPassword.value === confirmPassword.value &&
    passwordStrength.value >= 60
  )
})

// Preferencias
const notificationPreference = ref('all')
const notifyNewTask = ref(true)
const notifyTaskComment = ref(true)
const notifyDeadline = ref(true)
const emailNewTask = ref(false)
const emailSummary = ref(true)
const emailDeadline = ref(true)

// API Keys
const apiKeys = ref([
  {
    name: 'API Key Principal',
    active: true,
    created: '2022-05-15',
    value: 'pk_live_xxxxxxxxxxxxx'
  },
  {
    name: 'API Key Desarrollo',
    active: false,
    created: '2022-06-20',
    value: 'pk_test_xxxxxxxxxxxxx'
  }
])

// Observar los cambios en la contraseña para validar requisitos
watch(newPassword, (val) => {
  // Validar requisitos de contraseña
  hasMinLength.value = val.length >= 8
  hasUppercase.value = /[A-Z]/.test(val)
  hasNumber.value = /[0-9]/.test(val)
  hasSpecialChar.value = /[!@#$%^&*(),.?":{}|<>]/.test(val)
  
  // Calcular fuerza
  let strength = 0
  if (hasMinLength.value) strength += 25
  if (hasUppercase.value) strength += 25
  if (hasNumber.value) strength += 25
  if (hasSpecialChar.value) strength += 25
  
  passwordStrength.value = strength
})

// Métodos para la activación de licencia
const activateLicense = async () => {
  if (!licenseCode.value.trim()) {
    errorMessage.value = 'Por favor, ingrese un código promocional válido'
    return
  }
  
  loading.value = true
  try {
    const result = await authStore.activateLicense(licenseCode.value.trim())
    if (result) {
      license.value = authStore.license
      errorMessage.value = ''
      licenseCode.value = ''
    } else {
      errorMessage.value = authStore.errors[0] || 'Error al activar la licencia'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al activar la licencia'
  } finally {
    loading.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    selectedFile.value = event.dataTransfer.files[0]
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadLicenseFile = () => {
  if (!selectedFile.value) return
  
  loading.value = true
  
  // Simulación de carga de archivo
  setTimeout(() => {
    // Simulamos que la licencia se actualizó desde el servidor
    // y actualizamos el estado de authStore
    authStore.checkLicenseStatus()
    license.value = authStore.license
    
    // Limpiar selección
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    loading.value = false
  }, 1500)
}

const handleOpenFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const calculateRemainingDays = (expirationDate: string): number => {
  const expiry = new Date(expirationDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const toggleApiKey = (index: number) => {
  apiKeys.value[index].active = !apiKeys.value[index].active
}

const deleteApiKey = (index: number) => {
  apiKeys.value.splice(index, 1)
}

const createNewApiKey = () => {
  apiKeys.value.push({
    name: 'Nueva API Key',
    active: true,
    created: new Date().toISOString().split('T')[0],
    value: 'pk_' + Math.random().toString(36).substring(2, 15)
  })
}

// Cargar datos iniciales
onMounted(async () => {
  // Actualizar información de licencia
  if (authStore.isAuthenticated) {
    try {
      await authStore.checkLicenseStatus()
      license.value = authStore.license
    } catch (error) {
      console.error('Error al verificar estado de licencia:', error)
    }
  }
})
</script> 