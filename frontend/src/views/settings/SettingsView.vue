<template>
  <div class="settings-view">
    <div class="page-header">
      <h1>Configuración del Sistema</h1>
    </div>

    <!-- Configuración General -->
    <div class="settings-section">
      <div class="section-header">
        <h2>Configuración General</h2>
        <button class="btn-primary">
          <i class="fas fa-save"></i>
          Guardar Cambios
        </button>
      </div>

      <div class="settings-grid">
        <div class="setting-card">
          <h3>Información de la Empresa</h3>
          <div class="form-group">
            <label>Nombre de la Empresa</label>
            <input type="text" v-model="companyName" placeholder="Ingrese el nombre de la empresa" />
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input type="text" v-model="companyAddress" placeholder="Ingrese la dirección" />
          </div>
        </div>

        <div class="setting-card">
          <h3>Configuración de Notificaciones</h3>
          <div class="form-group">
            <label>Días de Anticipación para Alertas</label>
            <input type="number" v-model="notificationDays" min="1" max="90" />
          </div>
          <div class="form-group">
            <label>Correo Electrónico para Notificaciones</label>
            <input type="email" v-model="notificationEmail" placeholder="ejemplo@empresa.com" />
          </div>
        </div>

        <div class="setting-card">
          <h3>Configuración de Licencia</h3>
          
          <!-- Estado actual de la licencia -->
          <div class="license-info" v-if="license">
            <div class="license-status" :class="license.type === 'Licencia Activa' ? 'active' : 'warning'">
              <i class="fas fa-shield-alt"></i>
              {{ license.type }}
            </div>
            <p><strong>Tipo:</strong> {{ license.type }}</p>
            <p><strong>Vencimiento:</strong> {{ license.expiration_date }}</p>
            <p><strong>Días restantes:</strong> {{ calculateRemainingDays(license.expiration_date) }}</p>
          </div>
          
          <div class="license-info" v-else>
            <div class="license-status warning">
              <i class="fas fa-exclamation-triangle"></i>
              Sistema funcionando sin licencia
            </div>
            <p>El sistema está operando sin una licencia activada. Algunas funcionalidades como la gestión de usuarios y contratos están deshabilitadas.</p>
          </div>
          
          <!-- Mensaje de error -->
          <div class="error-message" v-if="errorMessage">
            {{ errorMessage }}
          </div>
          
          <!-- Activación por código promocional -->
          <div class="form-group mt-4">
            <label>Código Promocional</label>
            <div class="input-group">
              <input type="text" v-model="licenseCode" placeholder="Ingrese código promocional (ej: DEMOPACTA)" />
              <button class="btn-primary" @click="activateLicense" :disabled="!licenseCode.trim() || loading">
                <i class="fas fa-check" v-if="!loading"></i>
                <i class="fas fa-spinner fa-spin" v-else></i>
                Activar
              </button>
            </div>
            <small>Use códigos como DEMOPACTA (30 días) o TRYPACTA (7 días)</small>
          </div>
          
          <!-- Activación por archivo -->
          <div class="form-group mt-4">
            <label>Archivo de Licencia</label>
            <div class="file-upload" 
                 @drop.prevent="handleFileDrop"
                 @dragover.prevent
                 @dragenter.prevent
                 @click="handleOpenFileInput">
              <input 
                type="file" 
                ref="fileInput"
                style="display: none"
                accept=".lic"
                @change="handleFileSelect"
              />
              <div class="upload-content">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Arrastra y suelta un archivo .lic o haz clic para seleccionarlo</p>
              </div>
            </div>
            
            <div v-if="selectedFile" class="selected-file mt-2">
              <span>{{ selectedFile.name }}</span>
              <button @click.stop="removeFile" class="btn-icon">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <button v-if="selectedFile" class="btn-primary mt-2" @click="uploadLicenseFile" :disabled="loading">
              <i class="fas fa-upload" v-if="!loading"></i>
              <i class="fas fa-spinner fa-spin" v-else></i>
              Subir y Activar Licencia
            </button>
          </div>
        </div>

        <div class="setting-card">
          <h3>Preferencias de Interfaz</h3>
          <div class="form-group">
            <label>Tema de la Aplicación</label>
            <select v-model="theme">
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
          <div class="form-group">
            <label>Idioma</label>
            <select v-model="language">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuración de Seguridad -->
    <div class="settings-section">
      <div class="section-header">
        <h2>Seguridad</h2>
        <button class="btn-primary">
          <i class="fas fa-save"></i>
          Guardar Cambios
        </button>
      </div>

      <div class="settings-grid">
        <div class="setting-card">
          <h3>Cambio de Contraseña</h3>
          <div class="form-group">
            <label>Contraseña Actual</label>
            <input type="password" v-model="currentPassword" />
          </div>
          <div class="form-group">
            <label>Nueva Contraseña</label>
            <input type="password" v-model="newPassword" />
          </div>
          <div class="form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input type="password" v-model="confirmPassword" />
          </div>
          <button class="btn-primary">
            <i class="fas fa-key"></i>
            Cambiar Contraseña
          </button>
        </div>

        <div class="setting-card">
          <h3>Configuración de Sesión</h3>
          <div class="form-group">
            <label>Tiempo de Inactividad (minutos)</label>
            <input type="number" v-model="sessionTimeout" min="5" max="120" />
          </div>
          <div class="form-group">
            <label>Inicio de Sesión Automático</label>
            <div class="toggle-switch">
              <input type="checkbox" v-model="autoLogin" />
              <span class="toggle-slider"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { authService } from '../../services/auth.service'

// Configuración General
const companyName = ref('')
const companyAddress = ref('')
const notificationDays = ref(30)
const notificationEmail = ref('')
const licenseCode = ref('')
const theme = ref('light')
const language = ref('es')

// Licencia
const authStore = useAuthStore()
const license = ref(authStore.license)
const loading = ref(false)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

// Seguridad
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const sessionTimeout = ref(30)
const autoLogin = ref(false)

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
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    if (file.name.endsWith('.lic')) {
      selectedFile.value = file
      errorMessage.value = ''
    } else {
      errorMessage.value = 'Solo se permiten archivos con extensión .lic'
      selectedFile.value = null
    }
  }
}

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (file.name.endsWith('.lic')) {
      selectedFile.value = file
      errorMessage.value = ''
    } else {
      errorMessage.value = 'Solo se permiten archivos con extensión .lic'
    }
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadLicenseFile = async () => {
  if (!selectedFile.value) {
    errorMessage.value = 'Por favor, seleccione un archivo de licencia'
    return
  }
  
  loading.value = true
  try {
    const formData = new FormData()
    formData.append('license', selectedFile.value)
    
    const response = await authService.uploadLicenseFile(formData)
    license.value = response.license
    selectedFile.value = null
    errorMessage.value = ''
    
    // Actualizar el store con la nueva información de licencia
    await authStore.checkLicenseStatus()
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al procesar el archivo de licencia'
  } finally {
    loading.value = false
  }
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

<style lang="scss" scoped>
@import './settings.scss';
</style> 