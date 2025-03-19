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
import type { User } from '@/types/user';
import UsersTable from '@/components/modules/users/UsersTable.vue';
import UserDialog from '@/components/modules/users/UserDialog.vue';

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
  if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
    try {
      await userStore.deleteUser(user.id);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
}

async function handleToggleStatus(user: User) {
  try {
    await userStore.updateUser(user.id, {
      active: !user.active
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
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
    console.error('Error saving user:', error);
  }
}

let searchTimeout: number;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // The filtering is handled by the computed property
  }, 300);
}

onMounted(async () => {
  loading.value = true;
  try {
    await userStore.fetchUsers();
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@import '../../assets/main.scss';

.users {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: calc($spacing-unit * 4);

    h1 {
      color: var(--color-text-primary);
      font-weight: $font-weight-semibold;
    }
  }

  &__filters {
    display: flex;
    gap: calc($spacing-unit * 2);
    margin-bottom: calc($spacing-unit * 3);
  }
}

.search-box {
  flex: 1;
  
  input {
    width: 100%;
    padding: calc($spacing-unit * 1.5);
    border: 1px solid var(--color-border);
    border-radius: $border-radius;
    font-size: $font-size-base;
    background: var(--color-surface);
    color: var(--color-text-primary);
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }
}

.filter-group {
  select {
    padding: calc($spacing-unit * 1.5);
    border: 1px solid var(--color-border);
    border-radius: $border-radius;
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-size: $font-size-base;
    min-width: 150px;
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: calc($spacing-unit * 1.5) calc($spacing-unit * 3);
  border: none;
  border-radius: $border-radius;
  font-size: $font-size-base;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: $spacing-unit;
  
  &:hover {
    opacity: 0.9;
  }

  i {
    font-size: $font-size-base;
  }
}
</style>