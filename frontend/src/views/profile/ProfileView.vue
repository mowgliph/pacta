<template>
  <div class="p-6 bg-background dark:bg-gray-900">
    <div class="bg-surface dark:bg-gray-800 p-4 mb-4 rounded-lg shadow-sm">
      <h1 class="m-0 text-xl font-semibold mb-1 text-text-primary dark:text-white">Mi Perfil</h1>
      <p class="text-text-secondary dark:text-gray-400 mt-1 mb-4">Administre su información personal y seguridad</p>
      
      <TabView>
        <!-- Pestaña de Información General -->
        <TabPanel header="Información Personal">
          <template #header>
            <i class="pi pi-user mr-2"></i>
            <span>Información Personal</span>
          </template>
          
          <div class="bg-surface dark:bg-gray-800 rounded-lg p-6">
            <form @submit.prevent="updateProfile">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div class="flex items-center mb-3">
                    <Avatar 
                      :label="profileData.username?.substring(0, 2)?.toUpperCase()" 
                      size="xlarge" 
                      class="mr-3" 
                      :style="{ backgroundColor: getAvatarColor(profileData.username || '') }" 
                    />
                    <div>
                      <h3 class="m-0 text-lg text-text-primary dark:text-white">{{ profileData.username }}</h3>
                      <span class="text-text-secondary dark:text-gray-400 text-sm">
                        <Tag 
                          :value="getRoleName(profileData.role)" 
                          :severity="getRoleSeverity(profileData.role)"
                        />
                      </span>
                    </div>
                  </div>
                  
                  <div class="mb-4">
                    <label for="username" class="font-bold block mb-2 text-text-primary dark:text-white">Nombre de Usuario</label>
                    <InputText 
                      id="username" 
                      v-model="profileData.username" 
                      disabled 
                      aria-describedby="username-help"
                      class="w-full"
                    />
                    <small id="username-help" class="block text-xs text-text-secondary dark:text-gray-400">
                      No se puede cambiar el nombre de usuario
                    </small>
                  </div>
                  
                  <div class="mb-4">
                    <label for="email" class="font-bold block mb-2 text-text-primary dark:text-white">Correo Electrónico</label>
                    <InputText 
                      id="email" 
                      v-model="profileData.email" 
                      type="email" 
                      :class="{ 'p-invalid': formValidation.email.$error, 'w-full': true }"
                      aria-describedby="email-help"
                    />
                    <small v-if="formValidation.email.$error" id="email-help" class="p-error block">
                      {{ formValidation.email.$errors[0].$message }}
                    </small>
                  </div>
                  
                  <div class="mb-4">
                    <label for="lastLogin" class="font-bold block mb-2 text-text-primary dark:text-white">Último Acceso</label>
                    <InputText 
                      id="lastLogin" 
                      :value="formatDate(profileData.lastLogin)" 
                      disabled 
                      class="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <div class="mb-4">
                    <label class="font-bold block mb-3 text-text-primary dark:text-white">Estadísticas de Cuenta</label>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="bg-surface-variant dark:bg-gray-750 p-3 rounded-lg">
                        <div class="text-text-primary dark:text-white font-medium text-xl mb-2">{{ stats.contractsCreated }}</div>
                        <div class="text-text-secondary dark:text-gray-400">Contratos Creados</div>
                      </div>
                      <div class="bg-surface-variant dark:bg-gray-750 p-3 rounded-lg">
                        <div class="text-text-primary dark:text-white font-medium text-xl mb-2">{{ stats.daysActive }}</div>
                        <div class="text-text-secondary dark:text-gray-400">Días Activo</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mb-4">
                    <label class="font-bold block mb-3 text-text-primary dark:text-white">Estado de Licencia</label>
                    <div class="bg-surface-variant dark:bg-gray-750 p-3 rounded-lg mb-3">
                      <div class="flex justify-between items-center">
                        <div>
                          <div class="text-text-primary dark:text-white font-medium mb-1">
                            {{ profileData.license ? profileData.license.licenseType : 'Sin licencia' }}
                          </div>
                          <div class="text-text-secondary dark:text-gray-400 text-sm">
                            <template v-if="profileData.license">
                              Expira: {{ formatDate(profileData.license.expiryDate) }}
                            </template>
                            <template v-else>
                              No hay licencia activa
                            </template>
                          </div>
                        </div>
                        <Badge 
                          :value="profileData.license?.active ? 'Activa' : 'Inactiva'" 
                          :severity="profileData.license?.active ? 'success' : 'danger'" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex justify-end mt-4">
                <Button 
                  label="Guardar Cambios" 
                  icon="pi pi-check" 
                  type="submit" 
                  :loading="loading.profile"
                />
              </div>
            </form>
          </div>
        </TabPanel>
        
        <!-- Pestaña de Seguridad -->
        <TabPanel header="Seguridad">
          <template #header>
            <i class="pi pi-shield mr-2"></i>
            <span>Seguridad</span>
          </template>
          
          <div class="bg-surface dark:bg-gray-800 rounded-lg p-6">
            <h3 class="text-text-primary dark:text-white text-lg font-semibold mb-4">Cambiar Contraseña</h3>
            <form @submit.prevent="changePassword">
              <div class="mb-4">
                <label for="currentPassword" class="font-bold block mb-2 text-text-primary dark:text-white">Contraseña Actual</label>
                <Password 
                  id="currentPassword" 
                  v-model="passwordData.currentPassword" 
                  toggleMask 
                  :class="{ 'p-invalid': formValidation.currentPassword.$error, 'w-full': true }"
                  :feedback="false"
                  aria-describedby="currentPassword-help"
                />
                <small v-if="formValidation.currentPassword.$error" id="currentPassword-help" class="p-error block">
                  {{ formValidation.currentPassword.$errors[0].$message }}
                </small>
              </div>
              
              <div class="mb-4">
                <label for="newPassword" class="font-bold block mb-2 text-text-primary dark:text-white">Nueva Contraseña</label>
                <Password 
                  id="newPassword" 
                  v-model="passwordData.newPassword" 
                  toggleMask 
                  :class="{ 'p-invalid': formValidation.newPassword.$error, 'w-full': true }"
                  :feedback="true"
                  :promptLabel="'Ingrese una contraseña'"
                  :weakLabel="'Débil'"
                  :mediumLabel="'Media'"
                  :strongLabel="'Fuerte'"
                  aria-describedby="newPassword-help"
                />
                <small v-if="formValidation.newPassword.$error" id="newPassword-help" class="p-error block">
                  {{ formValidation.newPassword.$errors[0].$message }}
                </small>
              </div>
              
              <div class="mb-4">
                <label for="confirmPassword" class="font-bold block mb-2 text-text-primary dark:text-white">Confirmar Contraseña</label>
                <Password 
                  id="confirmPassword" 
                  v-model="passwordData.confirmPassword" 
                  toggleMask 
                  :feedback="false"
                  :class="{ 'p-invalid': formValidation.confirmPassword.$error, 'w-full': true }"
                  aria-describedby="confirmPassword-help"
                />
                <small v-if="formValidation.confirmPassword.$error" id="confirmPassword-help" class="p-error block">
                  {{ formValidation.confirmPassword.$errors[0].$message }}
                </small>
              </div>
              
              <div class="flex justify-end mt-4">
                <Button 
                  label="Cambiar Contraseña" 
                  icon="pi pi-lock" 
                  type="submit" 
                  severity="info"
                  :loading="loading.password"
                />
              </div>
            </form>
          </div>
        </TabPanel>
        
        <!-- Pestaña de Actividad -->
        <TabPanel header="Actividad Reciente">
          <template #header>
            <i class="pi pi-history mr-2"></i>
            <span>Actividad Reciente</span>
          </template>
          
          <div class="bg-surface dark:bg-gray-800 rounded-lg p-6">
            <Timeline :value="recentActivity" class="w-full">
              <template #content="slotProps">
                <div class="flex flex-col">
                  <span class="text-text-secondary dark:text-gray-400 text-sm mb-1">{{ formatDate(slotProps.item.date) }}</span>
                  <span class="text-text-primary dark:text-white font-medium">{{ slotProps.item.action }}</span>
                  <div v-if="slotProps.item.details" class="mt-1 text-sm text-text-secondary dark:text-gray-400">
                    {{ slotProps.item.details }}
                  </div>
                </div>
              </template>
              
              <template #opposite="slotProps">
                <div class="flex items-center justify-center bg-primary text-white rounded-full p-2">
                  <i :class="slotProps.item.icon"></i>
                </div>
              </template>
            </Timeline>
            
            <div v-if="!recentActivity.length" class="text-center p-4">
              <i class="pi pi-inbox text-6xl text-text-secondary dark:text-gray-400 mb-3"></i>
              <p class="text-text-secondary dark:text-gray-400">No hay actividad reciente para mostrar</p>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
    
    <!-- Toast para mensajes -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
// Importaciones comentadas de vuelidate - deberán instalarse estas dependencias
// import { useVuelidate } from '@vuelidate/core';
// import { required, email, minLength, sameAs, helpers } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';

// Define interfaces para tipar datos
interface License {
  licenseType: string;
  expiryDate: string | Date;
  active: boolean;
}

interface Activity {
  id: number;
  action: string;
  details?: string;
  createdAt: string | Date;
  date?: Date;
  icon?: string;
}

interface ProfileData {
  id: number | null;
  username: string;
  email: string;
  role: string;
  lastLogin: string | Date | null;
  license: License | null;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Composables
const toast = useToast();

// Estado
const loading = reactive({
  profile: false,
  password: false,
  activity: false,
});

const profileData = reactive<ProfileData>({
  id: null,
  username: '',
  email: '',
  role: '',
  lastLogin: null,
  license: null
});

const passwordData = reactive<PasswordData>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const recentActivity = ref<Activity[]>([]);

// Estadísticas de usuario
const stats = reactive({
  contractsCreated: 0,
  daysActive: 0
});

// Errores simulados para formularios (mientras no estén las dependencias de vuelidate)
const formValidation = reactive({
  email: { 
    $error: false, 
    $errors: [{ $message: 'Correo electrónico inválido' }] 
  },
  currentPassword: {
    $error: false,
    $errors: [{ $message: 'La contraseña actual es requerida' }]
  },
  newPassword: {
    $error: false,
    $errors: [{ $message: 'La nueva contraseña debe tener al menos 6 caracteres' }]
  },
  confirmPassword: {
    $error: false,
    $errors: [{ $message: 'Las contraseñas no coinciden' }]
  }
});

// Cargar datos del perfil
async function loadProfileData() {
  try {
    loading.profile = true;
    const response = await axios.get('/api/v1/users/profile/me');
    
    if (response.data && response.data.data) {
      const userData = response.data.data;
      profileData.id = userData.id;
      profileData.username = userData.username;
      profileData.email = userData.email;
      profileData.role = userData.role;
      profileData.lastLogin = userData.lastLogin;
      profileData.license = userData.license;
      
      // Calcular días activos
      if (userData.createdAt) {
        stats.daysActive = differenceInDays(new Date(), new Date(userData.createdAt));
      }
    }
  } catch (error: any) {
    console.error('Error al cargar datos del perfil:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos del perfil',
      life: 5000
    });
  } finally {
    loading.profile = false;
  }
}

// Cargar actividad reciente
async function loadRecentActivity() {
  try {
    loading.activity = true;
    const response = await axios.get('/api/v1/users/activity');
    
    if (response.data && response.data.data) {
      recentActivity.value = response.data.data.map((item: any) => {
        // Determinar icono según el tipo de actividad
        let icon = 'pi pi-info-circle';
        if (item.action.includes('login')) icon = 'pi pi-sign-in';
        if (item.action.includes('password')) icon = 'pi pi-lock';
        if (item.action.includes('contract')) icon = 'pi pi-file';
        
        return {
          ...item,
          date: new Date(item.createdAt),
          icon
        };
      });
    }
  } catch (error: any) {
    console.error('Error al cargar actividad reciente:', error);
  } finally {
    loading.activity = false;
  }
}

// Cargar estadísticas
async function loadStats() {
  try {
    const response = await axios.get('/api/v1/users/stats');
    
    if (response.data && response.data.data) {
      stats.contractsCreated = response.data.data.contractsCreated || 0;
    }
  } catch (error: any) {
    console.error('Error al cargar estadísticas:', error);
  }
}

// Actualizar perfil
async function updateProfile() {
  // Simulamos validación
  formValidation.email.$error = !profileData.email || !/\S+@\S+\.\S+/.test(profileData.email);
  if (formValidation.email.$error) return;
  
  try {
    loading.profile = true;
    await axios.put('/api/v1/users/profile/me', {
      email: profileData.email
    });
    
    toast.add({
      severity: 'success',
      summary: 'Perfil actualizado',
      detail: 'Su información ha sido actualizada correctamente',
      life: 3000
    });
  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo actualizar el perfil',
      life: 5000
    });
  } finally {
    loading.profile = false;
  }
}

// Cambiar contraseña
async function changePassword() {
  // Simulamos validación
  formValidation.currentPassword.$error = !passwordData.currentPassword;
  formValidation.newPassword.$error = !passwordData.newPassword || passwordData.newPassword.length < 6;
  formValidation.confirmPassword.$error = passwordData.newPassword !== passwordData.confirmPassword;
  
  if (formValidation.currentPassword.$error || formValidation.newPassword.$error || formValidation.confirmPassword.$error) {
    return;
  }
  
  try {
    loading.password = true;
    await axios.put('/api/v1/users/profile/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    // Limpiar formulario
    passwordData.currentPassword = '';
    passwordData.newPassword = '';
    passwordData.confirmPassword = '';
    
    toast.add({
      severity: 'success',
      summary: 'Contraseña actualizada',
      detail: 'Su contraseña ha sido cambiada correctamente',
      life: 3000
    });
  } catch (error: any) {
    console.error('Error al cambiar contraseña:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo cambiar la contraseña',
      life: 5000
    });
  } finally {
    loading.password = false;
  }
}

// Obtener nombre legible para el rol
function getRoleName(role: string): string {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'advanced': return 'Avanzado';
    case 'readonly': return 'Solo lectura';
    default: return role;
  }
}

// Obtener severidad para el rol
function getRoleSeverity(role: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
  switch (role) {
    case 'admin': return 'danger';
    case 'advanced': return 'warning';
    case 'readonly': return 'info';
    default: return undefined;
  }
}

// Generar color de avatar basado en el nombre de usuario
function getAvatarColor(username: string): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#F97316', '#14B8A6', '#6366F1', '#D946EF'
  ];
  
  // Generar un índice basado en la suma de los códigos ASCII del nombre de usuario
  const sum = username.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

// Formatear fecha
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: es });
}

// Cargar datos al montar el componente
onMounted(() => {
  loadProfileData();
  loadRecentActivity();
  loadStats();
});
</script>