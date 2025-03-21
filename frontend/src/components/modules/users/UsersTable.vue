<template>
  <div class="users-table">
    <table v-if="users.length">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Último Acceso</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span class="role-badge" :class="`role-${user.role}`">
              {{ user.role === 'admin' ? 'Administrador' : 'Usuario' }}
            </span>
          </td>
          <td>
            <span class="status-badge" :class="{ 'status-active': user.active }">
              {{ user.active ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td>{{ formatDate(user.lastLoginAt) }}</td>
          <td class="actions">
            <button @click="$emit('edit', user)" class="btn-icon" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button 
              @click="$emit('toggle-status', user)" 
              class="btn-icon"
              :title="user.active ? 'Desactivar' : 'Activar'"
            >
              <i :class="user.active ? 'fas fa-ban' : 'fas fa-check'"></i>
            </button>
            <button 
              v-if="!user.isAdmin"
              @click="$emit('delete', user)" 
              class="btn-icon btn-danger"
              title="Eliminar"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="loading" class="loading">
      Cargando usuarios...
    </div>
    <div v-else class="no-data">
      No se encontraron usuarios
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
  if (!date) return 'Nunca';
  return format(new Date(date), 'dd MMM, yyyy HH:mm');
}
</script>

<style lang="scss" scoped>
@use './usersTable.scss';
</style>