<template>
  <div class="flex items-center justify-center flex-col min-h-screen p-8 bg-background dark:bg-gray-900 text-center">
    <div class="max-w-2xl w-full bg-surface dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
      <h1 class="text-2xl font-bold mb-4 text-text-primary dark:text-white">Licencia Requerida</h1>
      <p class="text-text-secondary dark:text-gray-400 mb-8">Para acceder a esta funcionalidad, necesitas una licencia activa.</p>
      
      <div class="my-8 p-6 bg-surface-variant dark:bg-gray-750 rounded-lg shadow-sm" v-if="!authStore.hasActiveLicense">
        <div class="flex items-center gap-4 mb-4 md:flex-row flex-col">
          <input 
            v-model="licenseCode" 
            type="text" 
            placeholder="Ingresa tu código de promoción"
            @keyup.enter="activateLicense"
            class="flex-1 w-full px-4 py-2 border rounded-md text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white dark:border-gray-600"
            :class="{ 'border-error focus:border-error focus:ring-error': authStore.errors.length > 0, 'border-border': !authStore.errors.length }"
          >
          <button 
            @click="activateLicense" 
            class="px-4 py-2 bg-primary text-white rounded-md transition-colors hover:bg-primary-dark disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide font-medium min-w-[120px]" 
            :disabled="!licenseCode.trim()"
          >
            Activar
          </button>
        </div>
        <p class="text-sm text-text-secondary dark:text-gray-400 mt-2">Códigos disponibles: DEMOPACTA (30 días) o TRYPACTA (7 días)</p>
        
        <div class="mt-8" v-if="showFileUpload">
          <div 
            class="border-2 border-dashed border-border dark:border-gray-600 rounded-lg p-8 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10" 
            @click="triggerFileInput"
            @drop.prevent="handleFileDrop"
            @dragover.prevent
            @dragenter.prevent
          >
            <input 
              type="file" 
              ref="fileInput"
              accept=".lic"
              @change="handleFileSelect"
              class="hidden"
            >
            <div class="flex flex-col items-center gap-2">
              <i class="fas fa-cloud-upload-alt text-4xl text-primary"></i>
              <p class="text-text-secondary dark:text-gray-400 m-0">Arrastra y suelta tu archivo .lic aquí</p>
              <p class="text-sm text-text-secondary dark:text-gray-400 m-0">o haz clic para seleccionar</p>
            </div>
          </div>
          <div v-if="selectedFile" class="flex justify-between items-center mt-4 p-2 bg-primary/10 dark:bg-primary/20 rounded-md">
            <span class="text-text-primary dark:text-white">{{ selectedFile.name }}</span>
            <button @click="removeFile" class="text-error hover:text-error-dark p-1 rounded-full hover:bg-error/10">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div v-if="authStore.errors.length > 0" class="text-sm text-error mt-2 p-2 bg-error/10 rounded-md">
          {{ authStore.errors[0] }}
        </div>
      </div>

      <div class="my-8 p-6 bg-surface-variant dark:bg-gray-750 rounded-lg shadow-sm" v-if="authStore.license">
        <h2 class="text-xl font-semibold mb-6 text-text-primary dark:text-white">Estado de tu Licencia</h2>
        <div class="grid gap-4 text-left">
          <div class="flex justify-between items-center py-2">
            <span class="text-text-secondary dark:text-gray-400">Tipo:</span>
            <span class="text-text-primary dark:text-white font-medium">{{ authStore.license.type }}</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-text-secondary dark:text-gray-400">Fecha de Expiración:</span>
            <span class="text-text-primary dark:text-white font-medium">{{ formatDate(authStore.license.expiration_date) }}</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-text-secondary dark:text-gray-400">Características:</span>
            <span class="text-text-primary dark:text-white font-medium">
              Usuarios: {{ authStore.license.features.maxUsers }},
              Contratos: {{ authStore.license.features.maxContracts }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-4 mt-8">
        <button 
          @click="contactSupport" 
          class="px-4 py-2 bg-primary text-white rounded-md transition-colors hover:bg-primary-dark min-w-[150px]"
        >
          Contactar Soporte
        </button>
        <button 
          @click="logout" 
          class="px-4 py-2 border border-primary text-primary bg-transparent rounded-md transition-colors hover:bg-primary/10 min-w-[150px]"
        >
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