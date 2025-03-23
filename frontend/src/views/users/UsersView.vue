<template>
  <div class="users-view">
    <!-- Cabecera con título y botón para añadir usuario -->
    <div class="surface-section p-4 mb-4 flex justify-content-between align-items-center border-round-lg shadow-1">
      <div>
        <h1 class="m-0 text-xl font-semibold">Gestión de Usuarios</h1>
        <p class="text-color-secondary mt-1">Administre los usuarios y sus permisos en el sistema</p>
      </div>
      <PrimeButton 
        label="Nuevo Usuario" 
        icon="pi pi-user-plus" 
        @click="showCreateDialog" 
        class="p-button-primary" 
      />
    </div>

    <!-- Estadísticas de usuarios -->
    <div class="grid mb-4">
      <div class="col-12 md:col-4">
        <div class="surface-card p-4 border-round-lg shadow-1">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-2">Total Usuarios</span>
              <div class="text-900 font-bold text-2xl">{{ userStats.total }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-primary border-round" style="width: 3.5rem; height: 3.5rem;">
              <i class="pi pi-users text-white text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-12 md:col-4">
        <div class="surface-card p-4 border-round-lg shadow-1">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-2">Usuarios Activos</span>
              <div class="text-900 font-bold text-2xl">{{ userStats.active }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-success border-round" style="width: 3.5rem; height: 3.5rem;">
              <i class="pi pi-check-circle text-white text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-12 md:col-4">
        <div class="surface-card p-4 border-round-lg shadow-1">
          <div class="flex justify-content-between mb-3">
            <div>
              <span class="block text-500 font-medium mb-2">Administradores</span>
              <div class="text-900 font-bold text-2xl">{{ userStats.admins }}</div>
            </div>
            <div class="flex align-items-center justify-content-center bg-danger border-round" style="width: 3.5rem; height: 3.5rem;">
              <i class="pi pi-shield text-white text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Componente de tabla de usuarios con loading state -->
    <div class="surface-card p-4 border-round-lg shadow-1">
      <UsersTable 
        :users="users"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle-status="handleToggleStatus"
      />
    </div>

    <!-- Diálogo para crear/editar usuario -->
    <UserDialog
      v-model:visible="dialogVisible"
      :user="selectedUser"
      @save="handleSave"
    />
    
    <!-- Toast para mensajes -->
    <PrimeToast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import UsersTable from '@/components/modules/users/UsersTable.vue';
import UserDialog from '@/components/modules/users/UserDialog.vue';
import axios from 'axios';
import type { User } from '@/types/user';

// Composables
const toast = useToast();

// Estado
const users = ref<User[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const selectedUser = ref<User | null>(null);

// Estadísticas de usuarios
const userStats = computed(() => {
  return {
    total: users.value.length,
    active: users.value.filter(user => user.active).length,
    admins: users.value.filter(user => user.role === 'admin').length
  };
});

// Mostrar diálogo para crear nuevo usuario
function showCreateDialog() {
  selectedUser.value = null;
  dialogVisible.value = true;
}

// Manejar edición de usuario
function handleEdit(user: User) {
  selectedUser.value = user;
  dialogVisible.value = true;
}

// Manejar eliminación de usuario
async function handleDelete(user: User) {
  try {
    loading.value = true;
    await axios.delete(`/api/v1/users/${user.id}`);
    
    // Actualizar lista de usuarios
    users.value = users.value.filter(u => u.id !== user.id);
    
    toast.add({
      severity: 'success',
      summary: 'Usuario eliminado',
      detail: `El usuario ${user.username} ha sido eliminado correctamente`,
      life: 3000
    });
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el usuario. Intente nuevamente.',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
}

// Manejar cambio de estado de usuario
async function handleToggleStatus(user: User) {
  try {
    loading.value = true;
    await axios.patch(`/api/v1/users/${user.id}/toggle-status`);
    
    // Actualizar estado en la lista local
    const updatedUser = users.value.find(u => u.id === user.id);
    if (updatedUser) {
      updatedUser.active = !updatedUser.active;
      
      toast.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `Usuario ${updatedUser.active ? 'activado' : 'desactivado'} correctamente`,
        life: 3000
      });
    }
  } catch (error: any) {
    console.error('Error al cambiar estado de usuario:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cambiar el estado del usuario. Intente nuevamente.',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
}

// Guardar usuario (crear o actualizar)
async function handleSave(userData: User) {
  try {
    loading.value = true;
    
    if (selectedUser.value) {
      // Actualizar usuario existente
      await axios.put(`/api/v1/users/${selectedUser.value.id}`, userData);
      
      // Actualizar usuario en la lista local
      const index = users.value.findIndex(u => u.id === selectedUser.value!.id);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...userData };
      }
      
      toast.add({
        severity: 'success',
        summary: 'Usuario actualizado',
        detail: `El usuario ${userData.username} ha sido actualizado correctamente`,
        life: 3000
      });
    } else {
      // Crear nuevo usuario
      const response = await axios.post('/api/v1/users', userData);
      
      // Añadir a la lista local
      users.value.push(response.data.data);
      
      toast.add({
        severity: 'success',
        summary: 'Usuario creado',
        detail: `El usuario ${userData.username} ha sido creado correctamente`,
        life: 3000
      });
    }
    
    // Cerrar diálogo
    dialogVisible.value = false;
  } catch (error: any) {
    console.error('Error al guardar usuario:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'No se pudo guardar el usuario. Intente nuevamente.',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
}

// Cargar usuarios al montar el componente
onMounted(async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/v1/users');
    users.value = response.data.data;
  } catch (error: any) {
    console.error('Error al cargar usuarios:', error);
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los usuarios. Intente recargar la página.',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.users-view {
  padding: 1.5rem;
  
  .grid {
    --grid-gutter: 0.75rem;
  }
}
</style>