<template>
  <div class="license-required">
    <div class="content">
      <h1>Licencia Requerida</h1>
      <p>Para acceder a esta funcionalidad, necesitas una licencia activa.</p>
      
      <div class="license-form" v-if="!authStore.hasActiveLicense">
        <div class="input-group">
          <input 
            v-model="licenseCode" 
            type="text" 
            placeholder="Ingresa tu código de promoción"
            @keyup.enter="activateLicense"
            :class="{ 'error': authStore.errors.length > 0 }"
          >
          <button @click="activateLicense" class="btn-primary" :disabled="!licenseCode.trim()">
            Activar
          </button>
        </div>
        <p class="hint">Códigos disponibles: DEMOPACTA (30 días) o TRYPACTA (7 días)</p>
        
        <div class="file-upload" v-if="showFileUpload">
          <div class="upload-area" 
               @click="triggerFileInput"
               @drop.prevent="handleFileDrop"
               @dragover.prevent
               @dragenter.prevent>
            <input 
              type="file" 
              ref="fileInput"
              accept=".lic"
              @change="handleFileSelect"
              class="file-input"
              style="display: none"
            >
            <div class="upload-content">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Arrastra y suelta tu archivo .lic aquí</p>
              <p class="sub-text">o haz clic para seleccionar</p>
            </div>
          </div>
          <div v-if="selectedFile" class="selected-file">
            <span>{{ selectedFile.name }}</span>
            <button @click="removeFile" class="btn-icon">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div v-if="authStore.errors.length > 0" class="error-message">
          {{ authStore.errors[0] }}
        </div>
      </div>

      <div class="license-info" v-if="authStore.license">
        <h2>Estado de tu Licencia</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Tipo:</span>
            <span class="value">{{ authStore.license.type }}</span>
          </div>
          <div class="info-item">
            <span class="label">Fecha de Expiración:</span>
            <span class="value">{{ formatDate(authStore.license.expiration_date) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Características:</span>
            <span class="value">
              Usuarios: {{ authStore.license.features.maxUsers }},
              Contratos: {{ authStore.license.features.maxContracts }}
            </span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="contactSupport" class="btn-primary">
          Contactar Soporte
        </button>
        <button @click="logout" class="btn-secondary">
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const licenseCode = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const showFileUpload = ref(false)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    validateAndSetFile(input.files[0])
  }
}

const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    validateAndSetFile(event.dataTransfer.files[0])
  }
}

const validateAndSetFile = (file: File) => {
  if (file.name.endsWith('.lic')) {
    selectedFile.value = file
  } else {
    authStore.errors = ['Por favor, selecciona un archivo .lic válido']
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const activateLicense = async () => {
  try {
    if (!licenseCode.value.trim()) {
      authStore.errors = ['Por favor, ingresa un código de promoción']
      return
    }

    await authStore.activateLicense(licenseCode.value.toUpperCase())
    router.push('/')
  } catch (error) {
    console.error('Error al activar la licencia:', error)
    authStore.errors = ['Error al activar la licencia. Por favor, intenta nuevamente.']
  }
}

const contactSupport = () => {
  window.location.href = 'mailto:soporte@pacta.cu'
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
@use './licenceRequired.scss';
</style> 