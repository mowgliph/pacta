<template>
  <div class="users">
    <header class="users__header">
      <h1>Gestión de Usuarios</h1>
      <button @click="showCreateDialog" class="btn-primary">
        <i class="fas fa-user-plus"></i> Nuevo Usuario
      </button>
    </header>

    <div class="users__filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          v-model="filters.search"
          type="text"
          placeholder="Buscar usuarios..."
          @input="handleSearch"
        />
      </div>
      
      <div class="filter-group">
        <select v-model="filters.role">
          <option value="">Todos los Roles</option>
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
          <option value="editor">Editor</option>
        </select>
      </div>
    </div>

    <UsersTable 
      :users="filteredUsers"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
      @toggle-status="handleToggleStatus"
    />

    <UserDialog
      v-model:visible="dialogVisible"
      :user="selectedUser"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../../stores/user';
import type { User } from '../../types/user';
import UsersTable from '../../components/modules/users/UsersTable.vue';
import UserDialog from '../../components/modules/users/UserDialog.vue';

const userStore = useUserStore();
const loading = ref(false);
const dialogVisible = ref(false);
const selectedUser = ref<User | null>(null);

const filters = ref({
  search: '',
  role: ''
});

const filteredUsers = computed(() => {
  let users = userStore.users || [];
  
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    users = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.value.role) {
    users = users.filter(user => user.role === filters.value.role);
  }

  return users;
});

function showCreateDialog() {
  selectedUser.value = null;
  dialogVisible.value = true;
}

function handleEdit(user: User) {
  selectedUser.value = user;
  dialogVisible.value = true;
}

async function handleDelete(user: User) {
  if (confirm(`¿Está seguro que desea eliminar al usuario ${user.username}?`)) {
    try {
      await userStore.deleteUser(user.id);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  }
}

async function handleToggleStatus(user: User) {
  try {
    await userStore.updateUser(user.id, {
      active: !user.active
    });
  } catch (error) {
    console.error('Error al cambiar el estado del usuario:', error);
  }
}

async function handleSave(userData: Partial<User>) {
  try {
    if (selectedUser.value) {
      await userStore.updateUser(selectedUser.value.id, userData);
    } else {
      await userStore.createUser(userData);
    }
    dialogVisible.value = false;
  } catch (error) {
    console.error('Error al guardar usuario:', error);
  }
}

let searchTimeout: number;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // El filtrado se maneja a través de la propiedad computada
  }, 300);
}

onMounted(async () => {
  loading.value = true;
  try {
    await userStore.fetchUsers();
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@use './usersView.scss';
</style>