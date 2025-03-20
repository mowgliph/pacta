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
import { useAuthStore } from '@/stores/auth'
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
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;

.license-required {
  @include m.flex-center;
  @include m.flex-column;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background-color: c.$color-background;

  .content {
    @include m.card;
    max-width: 600px;
    width: 100%;
    text-align: center;
    padding: 2rem;

    h1 {
      @include m.heading-1;
      margin-bottom: 1rem;
      color: c.$color-text-primary;
    }

    p {
      @include m.text-base;
      margin-bottom: 2rem;
      color: c.$color-text-secondary;
    }

    .license-form {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: c.$color-surface;
      border-radius: v.$border-radius-md;
      box-shadow: v.$shadow-sm;

      .input-group {
        @include m.flex-center;
        gap: 1rem;
        margin-bottom: 1rem;

        input {
          @include m.input;
          flex: 1;
          padding: v.$spacing-md;
          border: 1px solid c.$color-border;
          border-radius: v.$border-radius-md;
          font-size: v.$font-size-base;
          transition: v.$transition-fast;

          &:focus {
            outline: none;
            border-color: c.$color-primary;
            box-shadow: 0 0 0 2px rgba(c.$color-primary, 0.1);
          }

          &.error {
            border-color: c.$color-error;
          }
        }

        button {
          @include m.button-theme('primary');
          padding: v.$spacing-md v.$spacing-lg;
          min-width: 120px;
          font-weight: v.$font-weight-medium;
          text-transform: uppercase;
          letter-spacing: 0.5px;

          &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
        }
      }

      .file-upload {
        margin-top: 2rem;

        .upload-area {
          border: 2px dashed c.$color-border;
          border-radius: v.$border-radius-md;
          padding: 2rem;
          cursor: pointer;
          transition: v.$transition-fast;

          &:hover {
            border-color: c.$color-primary;
            background-color: rgba(c.$color-primary, 0.05);
          }

          .upload-content {
            @include m.flex-column;
            gap: 0.5rem;

            i {
              font-size: 2rem;
              color: c.$color-primary;
            }

            p {
              margin: 0;
              color: c.$color-text-secondary;

              &.sub-text {
                font-size: v.$font-size-sm;
              }
            }
          }
        }

        .selected-file {
          @include m.flex-between;
          margin-top: 1rem;
          padding: 0.5rem;
          background-color: rgba(c.$color-primary, 0.1);
          border-radius: v.$border-radius-sm;

          span {
            @include m.text-base;
            color: c.$color-text-primary;
          }

          .btn-icon {
            @include m.button-icon;
            color: c.$color-error;
          }
        }
      }

      .hint {
        @include m.text-small;
        margin-top: 0.5rem;
        color: c.$color-text-secondary;
      }

      .error-message {
        @include m.text-small;
        color: c.$color-error;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background-color: rgba(c.$color-error, 0.1);
        border-radius: v.$border-radius-sm;
      }
    }

    .license-info {
      margin: 2rem 0;
      padding: 1.5rem;
      background-color: c.$color-surface;
      border-radius: v.$border-radius-md;
      box-shadow: v.$shadow-sm;

      h2 {
        @include m.heading-2;
        margin-bottom: 1.5rem;
        color: c.$color-text-primary;
      }

      .info-grid {
        display: grid;
        gap: 1rem;
        text-align: left;

        .info-item {
          @include m.flex-between;
          padding: 0.5rem 0;

          .label {
            @include m.text-secondary;
          }

          .value {
            @include m.text-base;
            font-weight: v.$font-weight-medium;

            &.active {
              color: c.$color-success;
            }

            &.expired {
              color: c.$color-error;
            }

            &.suspended {
              color: c.$color-warning;
            }
          }
        }
      }
    }

    .actions {
      @include m.flex-center;
      gap: 1rem;
      margin-top: 2rem;

      button {
        @include m.button-base;
        min-width: 150px;

        &.btn-primary {
          @include m.button-theme('primary');
        }

        &.btn-secondary {
          @include m.button-theme('secondary');
        }
      }
    }
  }
}
</style> 