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
            <div class="license-status" :class="license.status === 'Licencia Activa' ? 'active' : 'warning'">
              <i class="fas fa-shield-alt"></i>
              {{ license.status }}
            </div>
            <p><strong>Tipo:</strong> {{ license.type }}</p>
            <p><strong>Vencimiento:</strong> {{ license.expiryDate }}</p>
            <p><strong>Días restantes:</strong> {{ license.remainingDays }}</p>
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
                 @click="$refs.fileInput.click()">
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
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'

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
@use '../styles/variables' as v;
@use '../styles/colors' as c;
@use '../styles/mixins' as m;

.settings-view {
  .page-header {
    margin-bottom: v.$spacing-xl;

    h1 {
      @include m.heading-1;
      color: c.$color-text-primary;
      margin: 0;
    }
  }

  .settings-section {
    @include m.card-style;
    margin-bottom: v.$spacing-xl;

    .section-header {
      @include m.flex-between;
      margin-bottom: v.$spacing-lg;

      h2 {
        @include m.heading-2;
        color: c.$color-text-primary;
        margin: 0;
      }
    }
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: v.$spacing-lg;
  }

  .setting-card {
    @include m.card-style;

    h3 {
      @include m.heading-3;
      color: c.$color-text-primary;
      margin: 0 0 v.$spacing-md;
    }

    .form-group {
      margin-bottom: v.$spacing-md;

      label {
        @include m.form-label;
        color: c.$color-text-secondary;
        margin-bottom: v.$spacing-xs;
      }

      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="number"],
      select {
        @include m.input;
        width: 100%;
        padding: v.$spacing-sm;
        border: 1px solid c.$color-border;
        border-radius: v.$border-radius-md;
        background-color: c.$color-surface;
        color: c.$color-text-primary;
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: c.$color-primary;
          box-shadow: 0 0 0 2px rgba(c.$color-primary, 0.2);
        }
      }
    }

    .license-info {
      margin-top: v.$spacing-md;
      padding: v.$spacing-md;
      background-color: c.$color-background;
      border-radius: v.$border-radius-md;

      p {
        margin: v.$spacing-xs 0;
        @include m.body-text;
        color: c.$color-text-primary;

        strong {
          color: c.$color-text-secondary;
        }

        span {
          &.active {
            @include m.status-color('active');
          }
        }
      }
      
      .license-status {
        display: inline-flex;
        align-items: center;
        gap: v.$spacing-xs;
        padding: v.$spacing-xs v.$spacing-sm;
        border-radius: v.$border-radius-sm;
        margin-bottom: v.$spacing-md;
        
        &.active {
          background-color: rgba(c.$color-success, 0.1);
          color: c.$color-success;
        }
        
        &.warning {
          background-color: rgba(c.$color-warning, 0.1);
          color: c.$color-warning;
        }
        
        i {
          font-size: v.$font-size-base;
        }
      }
    }
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .toggle-slider {
        background-color: c.$color-primary;
      }

      &:checked + .toggle-slider:before {
        transform: translateX(26px);
      }
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: c.$color-border;
      transition: .4s;
      border-radius: 24px;

      &:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: c.$color-surface;
        transition: .4s;
        border-radius: 50%;
      }
    }
  }
}

.error-message {
  margin: v.$spacing-md 0;
  padding: v.$spacing-sm v.$spacing-md;
  background-color: rgba(c.$color-error, 0.1);
  color: c.$color-error;
  border-radius: v.$border-radius-md;
  font-size: v.$font-size-sm;
}

.input-group {
  display: flex;
  gap: v.$spacing-xs;
  
  input {
    flex: 1;
  }
}

.mt-2 {
  margin-top: v.$spacing-sm;
}

.mt-4 {
  margin-top: v.$spacing-md;
}

.file-upload {
  border: 2px dashed c.$color-border;
  border-radius: v.$border-radius-md;
  padding: v.$spacing-md;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: c.$color-primary;
    background-color: rgba(c.$color-primary, 0.05);
  }
  
  .upload-content {
    text-align: center;
    
    i {
      font-size: 2rem;
      color: c.$color-text-secondary;
      margin-bottom: v.$spacing-sm;
    }
    
    p {
      margin: v.$spacing-xs 0;
      color: c.$color-text-secondary;
    }
  }
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: v.$spacing-xs v.$spacing-sm;
  background-color: rgba(c.$color-primary, 0.1);
  border-radius: v.$border-radius-sm;
  
  span {
    @include m.text-small;
    color: c.$color-text-primary;
  }
}

// Utility Classes
.btn-primary {
  @include m.button-theme('primary');
}

.btn-secondary {
  @include m.button-theme('secondary');
}

@media (max-width: v.$breakpoint-md) {
  .settings-view {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      @include m.flex-column;
      gap: v.$spacing-md;
      align-items: flex-start;
    }
  }
}
</style> 