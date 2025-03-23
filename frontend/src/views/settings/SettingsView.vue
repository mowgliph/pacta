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
            <small>Use códigos como DEMOPACTA o TRYPACTA</small>
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

    <!-- Gestión de Usuarios -->
    <div class="settings-section" v-if="isAdmin">
      <div class="section-header">
        <h2>Gestión de Usuarios</h2>
        <button class="btn-primary" @click="openNewUserModal">
          <i class="fas fa-user-plus"></i>
          Agregar Nuevo Usuario
        </button>
      </div>

      <div class="users-list">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingUsers">
                <td colspan="5" class="loading-row">
                  <i class="fas fa-spinner fa-spin"></i> Cargando usuarios...
                </td>
              </tr>
              <tr v-else-if="usersError">
                <td colspan="5" class="error-row">
                  <i class="fas fa-exclamation-triangle"></i> {{ usersError }}
                </td>
              </tr>
              <tr v-else-if="!usersList || usersList.length === 0">
                <td colspan="5" class="empty-row">
                  No hay usuarios registrados. Haga clic en "Agregar Nuevo Usuario" para crear uno.
                </td>
              </tr>
              <tr v-for="user in usersList" :key="user.id" :class="{ 'current-user': user.id === authStore.user?.id }">
                <td>
                  <div class="user-info">
                    <span class="username">{{ user.username }}</span>
                    <span class="admin-badge" v-if="user.role === 'admin'">Admin</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" :class="user.role">
                    {{ getRoleName(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="user.active ? 'active' : 'inactive'">
                    {{ user.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" @click="editUser(user)" title="Editar Usuario">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      class="btn-icon delete" 
                      @click="confirmDeleteUser(user)" 
                      title="Eliminar Usuario"
                      :disabled="user.id === authStore.user?.id">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para Nuevo Usuario -->
    <div class="modal" v-if="showUserModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
          <button class="btn-icon" @click="closeUserModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre de Usuario <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="userForm.username" 
              placeholder="Ingrese nombre de usuario"
              :class="{ 'input-error': userFormErrors.username }" 
            />
            <span class="error-message" v-if="userFormErrors.username">{{ userFormErrors.username }}</span>
          </div>
          <div class="form-group">
            <label>Email <span class="required">*</span></label>
            <input 
              type="email" 
              v-model="userForm.email" 
              placeholder="Ingrese email"
              :class="{ 'input-error': userFormErrors.email }" 
            />
            <span class="error-message" v-if="userFormErrors.email">{{ userFormErrors.email }}</span>
          </div>
          <div class="form-group" v-if="!editingUser">
            <label>Contraseña <span class="required">*</span></label>
            <input 
              type="password" 
              v-model="userForm.password" 
              placeholder="Ingrese contraseña"
              :class="{ 'input-error': userFormErrors.password }" 
            />
            <span class="error-message" v-if="userFormErrors.password">{{ userFormErrors.password }}</span>
          </div>
          <div class="form-group" v-else>
            <label>Nueva Contraseña <small>(dejar en blanco para mantener la actual)</small></label>
            <input 
              type="password" 
              v-model="userForm.password" 
              placeholder="Ingrese nueva contraseña si desea cambiarla"
            />
          </div>
          <div class="form-group">
            <label>Rol <span class="required">*</span></label>
            <select 
              v-model="userForm.role"
              :class="{ 'input-error': userFormErrors.role }"
              :disabled="editingUser && editingUser.id === authStore.user?.id || false"
            >
              <option value="admin">Administrador</option>
              <option value="advanced">Usuario Avanzado</option>
              <option value="readonly">Solo Lectura</option>
            </select>
            <span class="error-message" v-if="userFormErrors.role">{{ userFormErrors.role }}</span>
          </div>
          <div class="form-group" v-if="editingUser">
            <label>Estado</label>
            <div class="toggle-switch">
              <input 
                type="checkbox" 
                v-model="userForm.active"
                :disabled="editingUser.id === authStore.user?.id"
              />
              <span class="toggle-slider"></span>
              <span class="toggle-label">{{ userForm.active ? 'Activo' : 'Inactivo' }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeUserModal">Cancelar</button>
          <button 
            class="btn-primary" 
            @click="saveUser"
            :disabled="formSubmitting"
          >
            <i class="fas fa-spinner fa-spin" v-if="formSubmitting"></i>
            <i class="fas fa-save" v-else></i>
            {{ editingUser ? 'Actualizar' : 'Crear' }} Usuario
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación para Eliminar Usuario -->
    <div class="modal" v-if="showDeleteModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button class="btn-icon" @click="showDeleteModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Está seguro que desea eliminar al usuario <strong>{{ userToDelete?.username }}</strong>?</p>
          <p class="warning-text"><i class="fas fa-exclamation-triangle"></i> Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteModal = false">Cancelar</button>
          <button 
            class="btn-danger" 
            @click="deleteUser"
            :disabled="formSubmitting"
          >
            <i class="fas fa-spinner fa-spin" v-if="formSubmitting"></i>
            <i class="fas fa-trash-alt" v-else></i>
            Eliminar Usuario
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { authService } from '../../services/auth.service'
import { userService } from '../../services/user.service'
import type { User } from '@/types/api'

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

// Gestión de Usuarios
const isAdmin = computed(() => authStore.user?.role === 'admin')
const usersList = ref<User[]>([])
const loadingUsers = ref(false)
const usersError = ref('')
const showUserModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref<User | null>(null)
const userToDelete = ref<User | null>(null)
const formSubmitting = ref(false)

// Formulario para usuario
const userForm = ref({
  username: '',
  email: '',
  password: '',
  role: 'readonly' as 'admin' | 'advanced' | 'readonly',
  active: true
})

// Errores del formulario
const userFormErrors = ref({
  username: '',
  email: '',
  password: '',
  role: ''
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

// Cargar lista de usuarios
const loadUsers = async () => {
  if (!isAdmin.value) return
  
  loadingUsers.value = true
  usersError.value = ''
  
  try {
    usersList.value = await userService.getUsers()
  } catch (error: any) {
    usersError.value = error.message || 'Error al cargar usuarios'
    console.error('Error loading users:', error)
  } finally {
    loadingUsers.value = false
  }
}

// Abrir modal para nuevo usuario
const openNewUserModal = () => {
  editingUser.value = null
  userForm.value = {
    username: '',
    email: '',
    password: '',
    role: 'readonly',
    active: true
  }
  clearFormErrors()
  showUserModal.value = true
}

// Editar usuario existente
const editUser = (user: User) => {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    email: user.email,
    password: '',
    role: user.role as 'admin' | 'advanced' | 'readonly',
    active: user.active
  }
  clearFormErrors()
  showUserModal.value = true
}

// Cerrar modal de usuario
const closeUserModal = () => {
  showUserModal.value = false
  clearFormErrors()
}

// Limpiar errores del formulario
const clearFormErrors = () => {
  userFormErrors.value = {
    username: '',
    email: '',
    password: '',
    role: ''
  }
}

// Validar formulario
const validateUserForm = (): boolean => {
  let isValid = true
  clearFormErrors()
  
  if (!userForm.value.username.trim()) {
    userFormErrors.value.username = 'El nombre de usuario es requerido'
    isValid = false
  } else if (userForm.value.username.trim().length < 3) {
    userFormErrors.value.username = 'El nombre de usuario debe tener al menos 3 caracteres'
    isValid = false
  }
  
  if (!userForm.value.email.trim()) {
    userFormErrors.value.email = 'El email es requerido'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(userForm.value.email)) {
    userFormErrors.value.email = 'Formato de email inválido'
    isValid = false
  }
  
  if (!editingUser.value && !userForm.value.password.trim()) {
    userFormErrors.value.password = 'La contraseña es requerida'
    isValid = false
  } else if (!editingUser.value && userForm.value.password.length < 6) {
    userFormErrors.value.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }
  
  if (!userForm.value.role) {
    userFormErrors.value.role = 'El rol es requerido'
    isValid = false
  }
  
  return isValid
}

// Guardar usuario (crear o actualizar)
const saveUser = async () => {
  if (!validateUserForm()) return
  
  formSubmitting.value = true
  try {
    if (editingUser.value) {
      // Actualizar usuario existente
      const updateData: any = {
        username: userForm.value.username,
        email: userForm.value.email,
        role: userForm.value.role,
        active: userForm.value.active
      }
      
      // Solo incluir la contraseña si fue proporcionada
      if (userForm.value.password.trim()) {
        updateData.password = userForm.value.password
      }
      
      await userService.updateUser(editingUser.value.id, updateData)
    } else {
      // Crear nuevo usuario
      await userService.createUser({
        username: userForm.value.username,
        email: userForm.value.email,
        password: userForm.value.password,
        role: userForm.value.role
      })
    }
    
    // Recargar lista de usuarios
    await loadUsers()
    closeUserModal()
  } catch (error: any) {
    console.error('Error saving user:', error)
    // Mostrar error en el campo correspondiente si es posible
    if (error.message.includes('usuario o email ya está en uso')) {
      userFormErrors.value.username = 'El nombre de usuario o email ya está en uso'
      userFormErrors.value.email = 'El nombre de usuario o email ya está en uso'
    } else {
      // Mostrar error general
      usersError.value = error.message || 'Error al guardar usuario'
    }
  } finally {
    formSubmitting.value = false
  }
}

// Confirmar eliminación de usuario
const confirmDeleteUser = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

// Eliminar usuario
const deleteUser = async () => {
  if (!userToDelete.value) return
  
  formSubmitting.value = true
  try {
    await userService.deleteUser(userToDelete.value.id)
    
    // Recargar lista de usuarios
    await loadUsers()
    showDeleteModal.value = false
  } catch (error: any) {
    console.error('Error deleting user:', error)
    usersError.value = error.message || 'Error al eliminar usuario'
  } finally {
    formSubmitting.value = false
    userToDelete.value = null
  }
}

// Obtener nombre del rol en español
const getRoleName = (role: string): string => {
  switch (role) {
    case 'admin': return 'Administrador'
    case 'advanced': return 'Usuario Avanzado'
    case 'readonly': return 'Solo Lectura'
    default: return role
  }
}

// Cargar datos iniciales
onMounted(async () => {
  // Actualizar información de licencia
  if (authStore.isAuthenticated) {
    try {
      await authStore.checkLicenseStatus()
      license.value = authStore.license
      
      // Cargar usuarios si es administrador
      if (isAdmin.value) {
        await loadUsers()
      }
    } catch (error) {
      console.error('Error al verificar estado de licencia:', error)
    }
  }
})
</script>

<style lang="scss" scoped>
@use './settings.scss';

// Estilos adicionales para la sección de usuarios
.users-list {
  margin-top: 1.5rem;
  
  .table-container {
    width: 100%;
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    
    th {
      background-color: var(--bg-secondary);
      font-weight: 600;
    }
    
    .loading-row, .error-row, .empty-row {
      text-align: center;
      padding: 2rem 0;
      
      i {
        margin-right: 0.5rem;
      }
    }
    
    .error-row {
      color: var(--danger);
    }
    
    .admin-badge {
      display: inline-block;
      font-size: 0.75rem;
      background-color: var(--primary);
      color: white;
      padding: 0.125rem 0.375rem;
      border-radius: 10px;
      margin-left: 0.5rem;
    }
    
    .role-badge, .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 10px;
      font-size: 0.875rem;
    }
    
    .role-badge {
      &.admin {
        background-color: var(--primary);
        color: white;
      }
      
      &.advanced {
        background-color: var(--info);
        color: white;
      }
      
      &.readonly {
        background-color: var(--secondary);
        color: white;
      }
    }
    
    .status-badge {
      &.active {
        background-color: var(--success);
        color: white;
      }
      
      &.inactive {
        background-color: var(--warning);
        color: white;
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      
      .btn-icon {
        &.delete {
          color: var(--danger);
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }
    
    tr.current-user {
      background-color: rgba(var(--primary-rgb), 0.05);
    }
  }
}

// Estilos para el modal
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    background-color: var(--bg-primary);
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      
      h3 {
        margin: 0;
      }
    }
    
    .modal-body {
      padding: 1.5rem;
      
      .required {
        color: var(--danger);
      }
      
      .warning-text {
        color: var(--warning);
        
        i {
          margin-right: 0.5rem;
        }
      }
      
      .input-error {
        border-color: var(--danger);
      }
      
      .error-message {
        color: var(--danger);
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
      
      .toggle-label {
        margin-left: 0.5rem;
        font-size: 0.875rem;
      }
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }
  }
}

// Botón de peligro
.btn-danger {
  background-color: var(--danger);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: darken(#dc3545, 10%);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}
</style> 