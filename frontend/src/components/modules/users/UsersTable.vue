<template>
  <div class="users-table">
    <DataTable 
      :value="users" 
      :loading="loading"
      dataKey="id"
      stripedRows
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
      responsiveLayout="scroll"
      class="p-datatable-sm"
      v-model:filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['username', 'email', 'role']"
    >
      <template #header>
        <div class="flex justify-content-between align-items-center">
          <h4 class="m-0">Usuarios del Sistema</h4>
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Buscar..." class="p-inputtext-sm" />
          </span>
        </div>
      </template>

      <template #empty>
        <div class="empty-message">
          <i class="pi pi-users text-6xl mb-3 text-color-secondary"></i>
          <p>No se encontraron usuarios</p>
        </div>
      </template>

      <template #loading>
        <div class="flex align-items-center justify-content-center p-4">
          <ProgressSpinner style="width:50px;height:50px" strokeWidth="3" />
          <span class="ml-3">Cargando usuarios...</span>
        </div>
      </template>

      <Column field="username" header="Usuario" sortable>
        <template #body="{ data }">
          <div class="flex align-items-center">
            <Avatar :label="data.username.substring(0, 2).toUpperCase()" size="normal" class="mr-2" :style="{ backgroundColor: getAvatarColor(data.username) }" />
            <span>{{ data.username }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Buscar por usuario" class="p-column-filter" />
        </template>
      </Column>

      <Column field="email" header="Email" sortable>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Buscar por email" class="p-column-filter" />
        </template>
      </Column>

      <Column field="role" header="Rol" sortable>
        <template #body="{ data }">
          <Tag 
            :value="getRoleName(data.role)"
            :severity="getRoleSeverity(data.role)"
          />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown 
            v-model="filterModel.value" 
            @change="filterCallback()"
            :options="roleOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Seleccionar rol" 
            class="p-column-filter" 
            style="min-width: 12rem"
            showClear
          />
        </template>
      </Column>

      <Column field="active" header="Estado" sortable>
        <template #body="{ data }">
          <Badge 
            :value="data.active ? 'Activo' : 'Inactivo'" 
            :severity="data.active ? 'success' : 'danger'" 
          />
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown 
            v-model="filterModel.value" 
            @change="filterCallback()"
            :options="[
              { label: 'Activo', value: true },
              { label: 'Inactivo', value: false }
            ]" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Seleccionar estado" 
            class="p-column-filter" 
            style="min-width: 12rem"
            showClear
          />
        </template>
      </Column>

      <Column field="lastLogin" header="Último Acceso" sortable>
        <template #body="{ data }">
          <span>{{ formatDate(data.lastLogin) }}</span>
        </template>
      </Column>

      <Column header="Acciones" :exportable="false" style="min-width: 8rem">
        <template #body="{ data }">
          <div class="flex gap-2 justify-content-center">
            <Button 
              icon="pi pi-pencil" 
              @click="$emit('edit', data)" 
              class="p-button-rounded p-button-text p-button-info"
              tooltip="Editar usuario"
              tooltipOptions="top"
            />
            <Button 
              :icon="data.active ? 'pi pi-ban' : 'pi pi-check'" 
              @click="$emit('toggle-status', data)" 
              class="p-button-rounded p-button-text"
              :class="data.active ? 'p-button-warning' : 'p-button-success'"
              :tooltip="data.active ? 'Desactivar usuario' : 'Activar usuario'"
              tooltipOptions="top"
            />
            <Button 
              v-if="data.role !== 'admin' || data.username !== 'admin'"
              icon="pi pi-trash" 
              @click="confirmDelete(data)" 
              class="p-button-rounded p-button-text p-button-danger"
              tooltip="Eliminar usuario"
              tooltipOptions="top"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Diálogo de confirmación para eliminar usuario -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useConfirm } from 'primevue/useconfirm';
import type { User } from '@/types/user';

const confirm = useConfirm();

const props = defineProps({
  users: {
    type: Array as () => User[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete', 'toggle-status']);

// Opciones para el filtro de roles
const roleOptions = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Avanzado', value: 'advanced' },
  { label: 'Solo lectura', value: 'readonly' }
];

// Filtros para la tabla
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  username: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  role: { value: null, matchMode: FilterMatchMode.EQUALS },
  active: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Obtener nombre legible para el rol
function getRoleName(role: 'admin' | 'advanced' | 'readonly' | string): string {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'advanced':
      return 'Avanzado';
    case 'readonly':
      return 'Solo lectura';
    default:
      return role;
  }
}

// Obtener severidad para el rol
function getRoleSeverity(role: 'admin' | 'advanced' | 'readonly' | string): 'success' | 'info' | 'warning' | 'danger' | undefined {
  switch (role) {
    case 'admin':
      return 'danger';
    case 'advanced':
      return 'warning';
    case 'readonly':
      return 'info';
    default:
      return undefined;
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
  if (!date) return 'Nunca';
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: es });
}

// Confirmar eliminación
function confirmDelete(user: User): void {
  confirm.require({
    message: `¿Está seguro que desea eliminar el usuario ${user.username}?`,
    header: 'Confirmación de Eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, eliminar',
    rejectLabel: 'No, cancelar',
    acceptIcon: 'pi pi-trash',
    rejectIcon: 'pi pi-times',
    accept: () => {
      emit('delete', user);
    }
  });
}
</script>

<style lang="scss" scoped>
.users-table {
  border-radius: var(--border-radius);
  background-color: var(--surface-card);
  box-shadow: var(--card-shadow);
  
  .empty-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: var(--text-color-secondary);
  }

  :deep(.p-datatable-header) {
    background-color: var(--surface-section);
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
  }

  :deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: var(--surface-section);
    color: var(--text-color);
    font-weight: 600;
  }

  :deep(.p-datatable .p-datatable-tbody > tr) {
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--surface-hover);
    }
  }

  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem 1rem;
  }

  :deep(.p-tag) {
    font-size: 0.75rem;
    font-weight: 600;
  }

  :deep(.p-badge) {
    font-size: 0.75rem;
    font-weight: 600;
  }

  :deep(.p-button.p-button-icon-only) {
    width: 2rem;
    height: 2rem;
  }
}
</style>