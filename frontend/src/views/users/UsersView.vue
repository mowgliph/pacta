<template>
  <div class="users">
    <header class="users__header">
      <h1>User Management</h1>
      <button @click="showCreateDialog" class="btn-primary">
        <i class="fas fa-user-plus"></i> New User
      </button>
    </header>

    <div class="users__filters">
      <div class="search-box">
        <input 
          v-model="filters.search"
          type="text"
          placeholder="Search users..."
          @input="handleSearch"
        />
      </div>
      
      <div class="filter-group">
        <select v-model="filters.role">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
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
import { useUserStore } from '@/stores/user';
import UsersTable from '@/components/users/UsersTable.vue';
import UserDialog from '@/components/users/UserDialog.vue';

const userStore = useUserStore();
const loading = ref(false);
const dialogVisible = ref(false);
const selectedUser = ref(null);

const filters = ref({
  search: '',
  role: ''
});

const filteredUsers = computed(() => {
  let users = userStore.users;
  
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

onMounted(async () => {
  loading.value = true;
  try {
    await userStore.fetchUsers();
  } finally {
    loading.value = false;
  }
});

function showCreateDialog() {
  selectedUser.value = null;
  dialogVisible.value = true;
}

function handleEdit(user) {
  selectedUser.value = user;
  dialogVisible.value = true;
}

async function handleDelete(user) {
  if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
    try {
      await userStore.deleteUser(user.id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
}

async function handleToggleStatus(user) {
  try {
    await userStore.updateUser(user.id, {
      active: !user.active
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
  }
}

async function handleSave(userData) {
  try {
    if (selectedUser.value) {
      await userStore.updateUser(selectedUser.value.id, userData);
    } else {
      await userStore.createUser(userData);
    }
    dialogVisible.value = false;
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

function handleSearch() {
  // Debounce implementation could be added here
}
</script>

<style lang="scss" scoped>
.users {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-unit * 4;
  }

  &__filters {
    display: flex;
    gap: $spacing-unit * 2;
    margin-bottom: $spacing-unit * 3;
  }
}

.search-box {
  flex: 1;
  
  input {
    width: 100%;
    padding: $spacing-unit * 1.5;
    border: 1px solid $color-surface;
    border-radius: $border-radius;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: $color-accent;
    }
  }
}

.filter-group {
  select {
    padding: $spacing-unit * 1.5;
    border: 1px solid $color-surface;
    border-radius: $border-radius;
    background: white;
    font-size: 1rem;
    min-width: 150px;
    
    &:focus {
      outline: none;
      border-color: $color-accent;
    }
  }
}

.btn-primary {
  background: $color-accent;
  color: white;
  padding: $spacing-unit * 1.5 $spacing-unit * 3;
  border: none;
  border-radius: $border-radius;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: $spacing-unit;
  
  &:hover {
    opacity: 0.9;
  }
}
</style>