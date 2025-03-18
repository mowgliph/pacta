<template>
  <div class="users-table">
    <table v-if="users.length">
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Last Login</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span class="role-badge" :class="`role-${user.role}`">
              {{ user.role }}
            </span>
          </td>
          <td>
            <span class="status-badge" :class="{ 'status-active': user.active }">
              {{ user.active ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <td>{{ formatDate(user.lastLoginAt) }}</td>
          <td class="actions">
            <button @click="$emit('edit', user)" class="btn-icon">
              <i class="fas fa-edit"></i>
            </button>
            <button 
              @click="$emit('toggle-status', user)" 
              class="btn-icon"
              :title="user.active ? 'Deactivate' : 'Activate'"
            >
              <i :class="user.active ? 'fas fa-ban' : 'fas fa-check'"></i>
            </button>
            <button 
              v-if="!user.isAdmin"
              @click="$emit('delete', user)" 
              class="btn-icon btn-danger"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="loading" class="loading">
      Loading users...
    </div>
    <div v-else class="no-data">
      No users found
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

defineProps<{
  users: any[];
  loading: boolean;
}>();

defineEmits<{
  (e: 'edit', user: any): void;
  (e: 'delete', user: any): void;
  (e: 'toggle-status', user: any): void;
}>();

function formatDate(date: string | null) {
  if (!date) return 'Never';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}
</script>

<style lang="scss" scoped>
.users-table {
  width: 100%;
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: $border-radius;
    box-shadow: $shadow-sm;
  }

  th, td {
    padding: $spacing-unit * 2;
    text-align: left;
    border-bottom: 1px solid $color-surface;
  }

  th {
    font-weight: $font-weight-bold;
    color: $color-text-secondary;
    background: rgba($color-background, 0.5);
  }
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: $font-weight-medium;

  &.role-admin {
    background: rgba(#7C3AED, 0.1);
    color: #7C3AED;
  }

  &.role-user {
    background: rgba(#3B82F6, 0.1);
    color: #3B82F6;
  }
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  background: rgba(#EF4444, 0.1);
  color: #EF4444;

  &.status-active {
    background: rgba(#10B981, 0.1);
    color: #10B981;
  }
}

.actions {
  display: flex;
  gap: $spacing-unit;
}

.btn-icon {
  padding: 6px;
  border: none;
  background: none;
  cursor: pointer;
  color: $color-text-secondary;
  border-radius: $border-radius;
  
  &:hover {
    background: rgba($color-background, 0.5);
  }

  &.btn-danger {
    color: #EF4444;
    
    &:hover {
      background: rgba(#EF4444, 0.1);
    }
  }
}

.loading, .no-data {
  text-align: center;
  padding: $spacing-unit * 4;
  color: $color-text-secondary;
}
</style>